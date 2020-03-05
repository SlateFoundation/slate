<?php

namespace Emergence\FS;

use Site;

class StreamWrapper
{
    protected $node;
    protected $fh;

    public static function register($protocolName = 'emergence')
    {
        stream_wrapper_register($protocolName, __CLASS__, STREAM_IS_URL);
    }

    public static function getNodeByPath($path)
    {
        // truncate protocol
        $path = substr(strstr($path, '://'), 3);

        return Site::resolvePath($path);
    }

    public function stream_open($path, $mode, $options, &$opened_path)
    {
        if ($this->node = static::getNodeByPath($path)) {
            $this->fh = $this->node->get();

            return true;
        } else {
            return false;
        }
    }

    public function stream_read($bytes)
    {
        return fread($this->fh, $bytes);
    }

    public function stream_stat()
    {
        return false;
    }

    public function stream_eof()
    {
        return feof($this->fh);
    }

    public function url_stat($path, $flags)
    {
        if ($this->node = static::getNodeByPath($path)) {
            $mode = 0;

            if (is_a($this->node, 'SiteFile')) {
                $timestamp = $this->node->Timestamp;
                $size = $this->node->Size;
                $mode |= 0100000;
            } else {
                $timestamp = time();
                $size = 4096;
                $mode |= 0040000;
            }

            return [
                'dev' => 0, 'ino' => 0, 'mode' => $mode, 'nlink' => 0, 'uid' => 0, 'gid' => 0, 'rdev' => 0, 'size' => $size, 'atime' => 0, 'mtime' => $timestamp, 'ctime' => $timestamp, 'blksize' => -1, 'blocks' => -1,
            ];
        }
    }
}
