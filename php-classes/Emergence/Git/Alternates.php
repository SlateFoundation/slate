<?php

namespace Emergence\Git;

class Alternates
{
    protected static $cache;

    public static function getPaths(Repository $repository)
    {
        $repositoryPath = $repository->getGitDir();
        $repositoryCache = &static::$cache[$repositoryPath];

        if (!isset($repositoryCache)) {
            $alternatesPath = "$repositoryPath/objects/info/alternates";
            $repositoryCache = file_exists($alternatesPath) ? file($alternatesPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];
        }

        return $repositoryCache;
    }

    public static function writePaths(Repository $repository, array $paths)
    {
        $repositoryPath = $repository->getGitDir();

        file_put_contents("$repositoryPath/objects/info/alternates", implode(PHP_EOL, $paths).PHP_EOL);

        static::$cache[$repositoryPath] = $paths;
    }

    public static function addPath(Repository $repository, $path)
    {
        if ($path instanceof Repository) {
            $path = "{$path->getGitDir()}/objects";
        }

        $paths = static::getPaths($repository);

        if (!in_array($path, $paths)) {
            $paths[] = $path;
            static::writePaths($repository, $paths);
        }
    }
}
