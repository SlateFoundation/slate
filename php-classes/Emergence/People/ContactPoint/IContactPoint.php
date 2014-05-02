<?php

namespace Emergence\People\ContactPoint;

interface IContactPoint extends \Serializable
{
    public function __toString();
    public function toString();
    public function toHTML();
    public function loadString($string);
    public static function fromString($string);
    public static function fromSerialized($string);
    public static function getByString($string, $conditions = array(), $options = array());
    public static function getAllByString($string, $conditions = array(), $options = array());
}