<?php

namespace Emergence\Git;

class File implements HashableInterface
{
    use HashableTrait {
        __construct as hashableTraitConstruct;
    }

    const CONTENT_HASH = 'hash';
    const CONTENT_PATH_FS = 'path-fs';
    const CONTENT_PATH_REF = 'path-ref';
    const CONTENT_STRING = 'string';
    const CONTENT_RESOURCE = 'resource';
    const CONTENT_CALLABLE = 'callable';
    const CONTENT_HASHABLE = 'hashable';

    protected $content;
    protected $contentMode;

    // magic methods and property accessors
    public function __toString()
    {
        return sprintf(
            '%s(%s, %s%s)',
            static::class,
            $this->repository->getGitDir(),
            $this->writtenHash,
            $this->dirty ? "*($this->contentMode)" : ''
        );
    }

    // factories
    public static function fromHash(Repository $repository, $hash)
    {
        $file = new static($repository, $hash);

        return $file;
    }

    public static function fromContent(Repository $repository, $content)
    {
        $file = new static($repository);
        $file->setContent($content);

        return $file;
    }

    public static function fromFilesystemPath(Repository $repository, $path)
    {
        $file = new static($repository);
        $file->setFilesystemPath($path);

        return $file;
    }

    public static function fromRefPath(Repository $repository, $path)
    {
        $file = new static($repository);
        $file->setRefPath($path);

        return $file;
    }

    public function getObjectType()
    {
        return 'blob';
    }

    public function getContent()
    {
        return $this->content;
    }

    public function getContentMode()
    {
        return $this->contentMode;
    }

    public function setContent($content)
    {
        $this->dirty = true;

        $this->content = $content;

        if (is_string($content)) {
            $this->contentMode = self::CONTENT_STRING;
        } elseif (is_resource($content)) {
            $this->contentMode = self::CONTENT_RESOURCE;
        } elseif (is_callable($content)) {
            $this->contentMode = self::CONTENT_CALLABLE;
        } elseif ($content instanceof HashableInterface) {
            $this->contentMode = self::CONTENT_HASHABLE;
        } else {
            throw new \Exception('could not handle content');
        }
    }

    public function setHash($hash)
    {
        $this->content = $hash;
        $this->contentMode = self::CONTENT_HASH;

        $this->writtenHash = $hash;
        $this->dirty = false;
    }

    public function setFilesystemPath($path)
    {
        $this->dirty = true;
        $this->content = $path;
        $this->contentMode = self::CONTENT_PATH_FS;
    }

    public function setRefPath($path)
    {
        $this->dirty = true;
        $this->content = $path;
        $this->contentMode = self::CONTENT_PATH_REF;
    }

    // tree lifecycle API
    public function write()
    {
        if ($this->dirty) {
            $this->setHash($hash = $this->writeContent());
        }

        return $this->writtenHash;
    }

    public function read($hash)
    {
        $this->content = $this->writtenHash = $hash;
        $this->contentMode = self::CONTENT_HASH;
        $this->dirty = false;

        return true;
    }

    // internal library
    protected function writeContent()
    {
        if (!$this->repository) {
            throw new \Exception('must set repository before writing');
        }

        if (!$this->dirty) {
            return $this->writtenHash;
        }

        // first handle content modes that don't need piping content into hash-object
        switch ($this->contentMode) {
            case self::CONTENT_PATH_FS:
                return trim($this->repository->run('hash-object', ['-w', $this->content]));
            case self::CONTENT_PATH_REF:
                try {
                    return trim($this->repository->run('rev-parse', [$this->content]));
                } catch (\Exception $e) {
                    return null;
                }
            case self::CONTENT_HASHABLE:
                return $this->content->getHash();
        }

        // open hash-object process for piping
        $pipes = [];
        $process = proc_open(
            exec('which git').' hash-object -w --stdin',
            [
                0 => ['pipe', 'rb'], // STDIN
                1 => ['pipe', 'wb'], // STDOUT
                2 => ['pipe', 'w'],  // STDERR
            ],
            $pipes,
            $this->repository->getGitDir()
        );

        // // write tree content to mktree's STDIN
        switch ($this->contentMode) {
            case self::CONTENT_STRING:
                fwrite($pipes[0], $this->content);

                break;
            case self::CONTENT_RESOURCE:
                stream_copy_to_stream($this->content, $pipes[0]);

                break;
            case self::CONTENT_CALLABLE:
                $result = call_user_func($this->content, $pipes[0]);

                if (is_string($result)) {
                    fwrite($pipes[0], $result);
                }

                break;
            default:
                throw new \Exception('unhandled content mode: '.$this->contentMode);
        }

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
}
