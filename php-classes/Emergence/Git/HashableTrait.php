<?php

namespace Emergence\Git;

trait HashableTrait
{
    protected $dirty;
    protected $writtenHash;

    private $repository;

    // magic methods and property accessors
    public function __construct(Repository $repository = null, $hash = null)
    {
        $this->repository = $repository;
        $this->dirty = !$repository || !$hash || !$this->read($hash);
        $this->writtenHash = $this->dirty ? null : $hash;
    }

    public function __toString()
    {
        return sprintf(
            '%s(%s, %s%s)',
            static::class,
            $this->repository->getGitDir(),
            $this->writtenHash,
            $this->dirty ? '*' : ''
        );
    }

    abstract public function read($hash);

    abstract public function write();

    public function getRepository()
    {
        return $this->repository;
    }

    public function setRepository(Repository $repository)
    {
        $this->repository = $repository;
        $this->dirty = true;
        $this->writtenHash = null;
    }

    public function getDirty()
    {
        return $this->dirty;
    }

    public function getReadHash()
    {
        return $this->writtenHash;
    }

    public function getWrittenHash()
    {
        return $this->dirty ? null : $this->writtenHash;
    }

    public function getHash()
    {
        return $this->write();
    }
}
