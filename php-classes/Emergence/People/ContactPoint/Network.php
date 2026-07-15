<?php

namespace Emergence\People\ContactPoint;

class Network extends AbstractPoint
{
    public static $defaultLabel = 'Network Id';

    public static $sortWeight = 50;

    public static $networkLinkFormats = [
        'twitter.com' => 'http://twitter.com/%s',
        'facebook.com' => 'http://facebook.com/%s'
    ];

    public static $templates = [
        'Twitter' => [
            'class' => self::class
            ,'network' => 'twitter.com'
            ,'pattern' => '/^\w{1,15}$/'
        ]
        ,'Facebook' => [
            'class' => self::class
            ,'network' => 'facebook.com'
            ,'pattern' => '/^(\d+|[a-zA-Z\d.]{5,})$/'
        ]
    ];

    public $network;
    public $username;

    public function loadString($string)
    {
        if (preg_match('/^(.+)\s+on\s+(\S+)$/', (string) $string, $matches)) {
            $username = $matches[1];
            $network = $matches[2];
        } elseif (preg_match('/^([^\/]+)\/(.+)$/', (string) $string, $matches)) {
            $network = $matches[1];
            $username = $matches[2];
        }

        $this->network = $network;
        $this->username = $username;

        // update serialization
        $this->Data = $this->serialize();
    }

    public function toString()
    {
        return "$this->username on $this->network";
    }

    public function toHTML()
    {
        $networkClass = preg_replace('/[^a-zA-Z]/', '_', (string) $this->network);

        if (array_key_exists($this->network, static::$networkLinkFormats)) {
            $format = static::$networkLinkFormats[$this->network];

            if (is_string($format)) {
                $url = sprintf($format, urlencode((string) $this->username));
            } elseif (is_callable($format)) {
                $url = call_user_func($format, $this->username, $this->network);
            } else {
                throw new \Exception('Network formatter must be string or callable');
            }

            return sprintf(
                '<a class="contact-link contact-network contact-network-composite network-%s" href="%s">%s on %s</a>',
                $networkClass,
                htmlspecialchars((string) $url),
                htmlspecialchars((string) $this->username),
                htmlspecialchars((string) $this->network)
            );
        }
        return sprintf(
            '<span class="contact-network-fuzzy network-%1$s">%2$s on <a class="contact-link contact-network contact-network-networkonly network-%1$s" href="http://%3$s">%3$s</a></span>',
            $networkClass,
            htmlspecialchars((string) $this->username),
            htmlspecialchars((string) $this->network)
        );
    }

    public function serialize()
    {
        return "$this->network/$this->username";
    }

    public function unserialize($serialized)
    {
        [$network, $username] = explode('/', $serialized, 2);

        if (!$network || !$username) {
            throw new \Exception('Could not unserialize network/username');
        }

        $this->network = $network;
        $this->username = $username;
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        if (!$this->network || !$this->username) {
            $this->_validator->addError($this->network ? 'username' : 'network', 'Network and username must be supplied in the form "hostname/username" or "username on hostname"');
        }

        if ($errors = \Validators\FQDN::isInvalid($this->network)) {
            $this->_validator->addError('network', 'Network invalid:'.reset($errors));
        }

        // save results
        return $this->finishValidation();
    }
}
