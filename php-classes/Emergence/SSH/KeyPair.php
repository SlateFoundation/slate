<?php

namespace Emergence\SSH;

use Site;
use Exception;


class KeyPair
{
    protected $privateKey;
    protected $publicKey;
    protected $fingerprint;

    public function __construct($privateKey, $publicKey)
    {
        $this->privateKey = $privateKey;
        $this->publicKey = $publicKey;
    }

    public function getPrivateKey()
    {
        return $this->privateKey;
    }

    public function getPublicKey()
    {
        return $this->publicKey;
    }

    public function getFingerprint()
    {
        if (!$this->fingerprint) {
            $rawKey = explode(' ', $this->publicKey, 3)[1];
            $this->fingerprint = join(':', str_split(md5(base64_decode($rawKey)), 2));
        }

        return $this->fingerprint;
    }


    public static function generate($comment = null)
    {
        if (!$comment) {
            $comment = Site::getConfig('primary_hostname');
        }

        // generate key pair with ssh-keygen in temporary directory
        $keyTmpPath = tempnam(sys_get_temp_dir(), 'git-key');
        unlink($keyTmpPath);

        $command = sprintf(
            'ssh-keygen -q -t rsa -N "" -C %s -f %s; echo $?',
            escapeshellarg($comment),
            escapeshellarg($keyTmpPath)
        );

        $keyStatus = exec($command);

        if ($keyStatus != '0') {
            throw new Exception("Failed to execute command: $command\nExit output: $keyStatus");
        }

        // read generated public/private keys
        $keyPair = static::load($keyTmpPath, "$keyTmpPath.pub");

        // delete temporary files
        unlink($keyTmpPath);
        unlink("$keyTmpPath.pub");

        // return instance
        return $keyPair;
    }

    public static function load($privateKeyPath, $publicKeyPath = null)
    {
        if (!$publicKeyPath) {
            $publicKeyPath = "$privateKeyPath.pub";
        }

        $privateKey = trim(file_get_contents($privateKeyPath));
        $publicKey = trim(file_get_contents($publicKeyPath));

        if (!$privateKey || !$publicKey) {
            throw new Exception('Could not load public/private key pair');
        }

        return new static($privateKey, $publicKey);
    }
}