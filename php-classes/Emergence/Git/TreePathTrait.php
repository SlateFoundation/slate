<?php

namespace Emergence\Git;

trait TreePathTrait
{
    protected $repository;
    protected $ref;
    protected $path;

    protected $hash;
    protected $objectType;

    public function __construct(Repository $repository, $ref, $path = '')
    {
        $this->repository = $repository;
        $this->ref = $ref;
        $this->path = $path;
    }

    public function __toString()
    {
        return sprintf(
            '%s(%s, %s, %s)',
            static::class,
            $this->repository->getGitDir(),
            $this->ref,
            $this->path
        );
    }

    public function getRepository()
    {
        return $this->repository;
    }

    public function getRef()
    {
        return $this->ref;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function getRefPath()
    {
        return "{$this->ref}:{$this->path}";
    }

    public function getHash()
    {
        if (!$this->hash) {
            $this->hash = trim($this->repository->run('rev-parse', [$this->getRefPath()]));
        }

        return $this->hash;
    }

    public function getObjectType()
    {
        if (!$this->objectType) {
            $this->objectType = trim($this->repository->run('cat-file', ['-t', $this->getHash()]));
        }

        return $this->objectType;
    }
}
