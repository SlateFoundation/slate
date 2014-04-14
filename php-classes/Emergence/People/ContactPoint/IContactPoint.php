<?php

namespace Emergence\People\ContactPoint;

interface IContactPoint extends \Serializable
{
    public function __toString();
    public function toString();
    public function toHTML();
    public function loadString($string);
    static public function fromString($string);
    static public function fromSerialized($string);
    static public function getByString($string, $conditions = array(), $options = array());
    static public function getAllByString($string, $conditions = array(), $options = array());
}