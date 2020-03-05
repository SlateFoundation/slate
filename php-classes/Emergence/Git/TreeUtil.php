<?php

namespace Emergence\Git;

class TreeUtil
{
    /**
     * TODO: use yield and read one line at a time from stream.
     */
    public static function getPaths(Repository $repository, $tree, $options = [])
    {
        if ($tree instanceof HashableInterface) {
            $tree = $tree->getHash();
        }

        if (is_string($options)) {
            $options = ['patterns' => $options];
        }

        $command = 'GIT_INDEX_FILE='; // start with overriding GIT_INDEX_FILE to an empty value
        $command .= ' git';
        $command .= " --git-dir='{$repository->getGitDir()}'";
        $command .= ' ls-files';
        $command .= " --with-tree=$tree";

        if (!empty($options['patterns'])) {
            $command .= ' \''.implode('\' \'', (array) $options['patterns']).'\'';
        }

        $result = trim(shell_exec($command));

        return $result ? explode(PHP_EOL, $result) : [];
    }

    /**
     * @good-example static caching
     */
    public static function getHash(Repository $repository, $tree, $path = '')
    {
        if ($tree instanceof HashableInterface) {
            $tree = $tree->getHash();
        }

        static $cache = [];

        $treeCache = &$cache[$tree];

        if (!isset($treeCache)) {
            $treeCache = [];
        }

        $pathCache = &$treeCache[$path];

        if (!isset($pathCache)) {
            if ('' == $path) {
                $pathCache = $tree;
            } else {
                try {
                    $pathCache = trim($repository->run('rev-parse', ["$tree:$path"]));
                } catch (\Exception $e) {
                    $pathCache = false;
                }
            }
        }

        return $pathCache;
    }

    public static function getContent(Repository $repository, $tree, $path = '')
    {
        if ($tree instanceof HashableInterface) {
            $tree = $tree->getHash();
        }

        try {
            return $repository->run('cat-file', ['-p', "$tree:$path"]);
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function getStream(Repository $repository, $tree, $path = '')
    {
        if ($tree instanceof HashableInterface) {
            $tree = $tree->getHash();
        }

        $pipes = [];
        $process = proc_open(
            exec('which git')." cat-file -p $tree:$path",
            [
                1 => ['pipe', 'wb'], // STDOUT
                2 => ['pipe', 'w'],  // STDERR
            ],
            $pipes,
            $repository->getGitDir()
        );

        // check for error on STDERR and turn into exception
        stream_set_blocking($pipes[2], false);
        $error = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        if ($error) {
            $exitCode = proc_close($process);
            fclose($pipes[1]);

            throw new \Exception("git exited with code $exitCode: $error");
        }

        return [$pipes[1], $process];
    }

    public static function writeToDisk(Repository $repository, $tree, $outputPath, $path = '')
    {
        if ($tree instanceof HashableInterface) {
            $tree = $tree->getHash();
        }

        $refPath = "$tree:$path";

        if ($path) {
            $objectType = trim($repository->run('cat-file', ['-t', $refPath]));
        } else {
            $objectType = $this->getObjectType();
        }

        if ('tree' == $objectType) {
            if (!is_dir($outputPath)) {
                mkdir($outputPath, 0777, true);
            }

            return '0' == exec("git --git-dir={$repository->getGitDir()} archive $refPath | tar -xC $outputPath; echo \$?");
        }

        return '0' == exec("git --git-dir={$repository->getGitDir()} cat-file -p $refPath > $outputPath; echo \$?");
    }
}
