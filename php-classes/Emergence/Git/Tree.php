<?php

namespace Emergence\Git;

use Exception;

class Tree implements HashableInterface
{
    use HashableTrait;

    const REMOTES_MODE_FETCH = 'fetch';
    const REMOTES_MODE_LINK = 'link';
    const TREE_REGEX = '/^(?<mode>[^ ]+) (?<type>[^ ]+) (?<hash>[^\t]+)\t(?<path>.*)/';
    const EMPTY_TREE_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

    protected $root = [];
    protected $remotesMode = self::REMOTES_MODE_FETCH;

    // magic methods and property accessors
    public function getObjectType()
    {
        return 'tree';
    }

    public function getRoot()
    {
        return $this->root;
    }

    // tree manipulation API
    public function getPath($path)
    {
        return $this->getNodeRef($path);
    }

    /**
     * Set the content for a given path.
     *
     * $content may be:
     *
     * - a string hash for another tree
     * - an object implementing HashableInterface
     * - an array of child objects
     */
    public function setPath($path, $content)
    {
        $this->dirty = true;
        $node = &$this->getNodeRef($path);
        $node = $content;
    }

    public function deletePath($path)
    {
        $this->dirty = true;
        $node = &$this->getNodeRef($path);
        $node = null;
    }

    public function hasPath($path)
    {
        return (bool) $this->getNodeRef($path);
    }

    // tree lifecycle API
    public function write()
    {
        if ($this->dirty) {
            $this->writtenHash = $this->writeTree($this->root);
            $this->dirty = false;
        }

        return $this->writtenHash;
    }

    public function read($hash)
    {
        if ($this->dirty || $hash != $this->writtenHash) {
            $this->root = [];
            $this->loadTree($hash, $this->root);
        }

        return true;
    }

    public function dump($return = false, $contentColumn = 40)
    {
        $output = sprintf(
            "\n\ndumping tree %s#%s\n\n",
            $this->getRepository()->getGitDir(),
            $this->getWrittenHash() ?: ($this->getReadHash().'*')
        );

        $dumpNodes = function ($nodes, $indent = 1) use (&$dumpNodes, &$output, $contentColumn) {
            foreach ($nodes as $path => $node) {
                if (
                    is_array($node)
                    || is_string($node)
                    || $node instanceof static
                    || ($node instanceof HashableInterface && 'tree' == $node->getObjectType())
                ) {
                    $path .= '/';
                }

                $output .= str_repeat('   ', $indent);
                $output .= $path;
                $output .= str_repeat(is_array($node) ? ' ' : '-', $contentColumn - $indent * 3 - strlen($path));

                if (is_array($node)) {
                    $output .= "\n";
                    $dumpNodes($node, $indent + 1);
                } else {
                    if ($node instanceof self || $node instanceof File) {
                        $node = (string) $node;
                    } elseif (is_object($node)) {
                        $node = get_class($node)."($node".($node instanceof HashableInterface ? ", {$node->getRepository()->getGitDir()}, {$node->getObjectType()}, {$node->getHash()}" : '').')';
                    }

                    $output .= "$node\n";
                }
            }
        };

        $dumpNodes($this->root);

        $output .= "\n";

        if ($return) {
            return $output;
        } else {
            echo $output;
        }
    }

    public function commit($message = 'Commit tree')
    {
        return trim($this->getRepository()->run('commit-tree', [
            '-m', $message,
            $this->write(),
        ]));
    }

    // internal library
    protected function &getNodeRef($path)
    {
        $path = explode('/', $path);
        $tree = &$this->root;

        while (($name = array_shift($path)) && count($path)) {
            if ('.' == $name) {
                continue;
            }

            $tree = &$tree[$name];

            if (is_string($tree)) {
                $tree = $this->loadTree($tree);
            }
        }

        return $tree[$name];
    }

    protected function writeTree(&$tree)
    {
        // build tree file content
        $treeContent = '';
        foreach ($tree as $name => &$content) {
            if (!$content) {
                continue;
            } elseif (is_string($content)) {
                $type = 'tree';
                $hash = $content;
            } elseif (is_array($content)) {
                $type = 'tree';
                $hash = $content = $this->writeTree($content);
            } elseif ($content instanceof HashableInterface) {
                $type = $content->getObjectType();
                $hash = $content->getHash();

                if ($this->getRepository()->getGitDir() != $content->getRepository()->getGitDir()) {
                    if (self::REMOTES_MODE_FETCH == $this->remotesMode) {
                        static::copyObject($content->getRepository(), $this->getRepository(), $type, $hash);
                    } elseif (self::REMOTES_MODE_LINK == $this->remotesMode) {
                        Alternates::addPath($this->getRepository(), $content->getRepository());
                    } else {
                        throw new \Exception('unhandlable remotes mode: '.$this->remotesMode);
                    }
                }

                if ('tree' == $type) {
                    $content = $hash;
                }
            } else {
                throw new \Exception('unhandlable content for '.$name);
            }

            // skip empty trees
            if ('tree' == $type && $hash == static::EMPTY_TREE_HASH) {
                continue;
            }

            $mode = 'blob' == $type ? '100644' : '040000';

            $treeContent .= "$mode $type $hash\t$name\n";
        }

        // short-circuit for empty trees
        if (!$treeContent) {
            return static::EMPTY_TREE_HASH;
        }

        // open git-mktree process
        $pipes = [];
        $process = proc_open(
            static::getGitExecutablePath().' mktree',
            [
                0 => ['pipe', 'rb'], // STDIN
                1 => ['pipe', 'wb'], // STDOUT
                2 => ['pipe', 'w'],  // STDERR
            ],
            $pipes,
            $this->getRepository()->getGitDir()
        );

        // write tree content to mktree's STDIN
        fwrite($pipes[0], $treeContent);
        fclose($pipes[0]);

        // check for error on STDERR and turn into exception
        stream_set_blocking($pipes[2], false);
        $error = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        if ($error) {
            $exitCode = proc_close($process);

            throw new \Exception("git exited with code $exitCode: $error");
        }

        // read tree hash from output
        $hash = trim(stream_get_contents($pipes[1]));
        fclose($pipes[1]);

        // clean up
        proc_close($process);

        return $hash;
    }

    protected function loadTree($hash, array &$tree = [])
    {
        // open git-ls-tree process
        $pipes = [];
        $process = proc_open(
            static::getGitExecutablePath().' ls-tree '.$hash,
            [
                1 => ['pipe', 'wb'], // STDOUT
                2 => ['pipe', 'w'],  // STDERR
            ],
            $pipes,
            $this->getRepository()->getGitDir()
        );

        // check for error on STDERR and turn into exception
        stream_set_blocking($pipes[2], false);
        $error = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        if ($error) {
            $exitCode = proc_close($process);

            throw new \Exception("git exited with code $exitCode: $error");
        }

        // read tree hash from output
        while ($line = fgets($pipes[1])) {
            if (!preg_match(self::TREE_REGEX, $line, $matches)) {
                throw new \Exception("invalid tree line: $line");
            }

            $tree[$matches['path']] = 'tree' == $matches['type'] ? $matches['hash'] : File::fromHash($this->getRepository(), $matches['hash']);
        }

        fclose($pipes[1]);

        // clean up
        $exitCode = proc_close($process);

        if (0 !== $exitCode) {
            throw new \Exception('git ls-tree failed with exit code '.$exitCode);
        }

        return $tree;
    }

    protected static function getGitExecutablePath()
    {
        static $path;

        if (!isset($path)) {
            $path = exec('which git');
        }

        return $path;
    }

    /**
     * Deep-copy a blob or tree from one repository to another
     * TODO:
     * - Put this somewhere else?
     * - Stream trees like loadTree does?
     */
    protected static function copyObject(Repository $from, Repository $to, $type, $hash)
    {
        $git = static::getGitExecutablePath();
        $gitFrom = "$git --git-dir='{$from->getGitDir()}'";
        $gitTo = "$git --git-dir='{$to->getGitDir()}'";

        // copy the named object
        //printf("Copying %s %s from %s to %s\n", $type, $hash, $from->getGitDir(), $to->getGitDir());
        $cmd = "$gitFrom cat-file $type $hash | $gitTo hash-object -w -t $type --stdin";

        if (exec($cmd) != $hash) {
            throw new Exception("Failed to copy object: $cmd");
        }

        // iterate over children if it's a tree
        if ('tree' == $type) {
            // open git-ls-tree process
            $pipes = [];
            $process = proc_open(
                "$gitFrom ls-tree $hash",
                [
                    1 => ['pipe', 'wb'], // STDOUT
                    2 => ['pipe', 'w'],  // STDERR
                ],
                $pipes
            );

            // check for error on STDERR and turn into exception
            stream_set_blocking($pipes[2], false);
            $error = stream_get_contents($pipes[2]);
            fclose($pipes[2]);

            if ($error) {
                $exitCode = proc_close($process);

                throw new \Exception("git exited with code $exitCode: $error");
            }

            // read tree hash from output
            while ($line = fgets($pipes[1])) {
                if (!preg_match(self::TREE_REGEX, $line, $matches)) {
                    throw new \Exception("invalid tree line: $line");
                }

                static::copyObject($from, $to, $matches['type'], $matches['hash']);
            }

            fclose($pipes[1]);

            // clean up
            $exitCode = proc_close($process);

            if (0 !== $exitCode) {
                throw new \Exception('git ls-tree failed with exit code '.$exitCode);
            }
        }

        return true;
    }
}
