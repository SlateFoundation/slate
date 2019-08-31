<?php

class RecordValidator
{
    // configurables
    public static $autoTrim = true;

    // protected properties
    protected $_record;
    protected $_errors = array();


    // magic methods
    public function __construct(&$record, $autoTrim = null)
    {
        //init autoTrim option to static default
        if (!isset($autoTrim)) {
            $autoTrim = self::$autoTrim;
        }

        // apply autotrim
        if ($autoTrim) {
            self::trimArray($record);
        }

        // store record
        $this->_record = &$record;
    }


    // public instance methods
    public function resetErrors()
    {
        $this->_errors = array();
    }

    public function getErrors($id = false)
    {
        if ($id === false) {
            return $this->_errors;
        } elseif (array_key_exists($id, $this->_errors)) {
            return $this->_errors[$id];
        } else {
            return false;
        }
    }


    public function hasErrors($id = false)
    {
        if ($id === false) {
            return (count($this->_errors) > 0);
        } elseif (array_key_exists($id, $this->_errors)) {
            return true;
        } else {
            return false;
        }
    }


    public function addError($id, $errorMessage)
    {
        $this->_errors[$id] = $errorMessage;
    }


    public function validate($options)
    {
        // apply default
        $options = array_merge(array(
            'validator' => 'string'
            , 'required' => true
        ), $options);


        // check 'field'
        if (empty($options['field'])) {
            die('FormValidator: required option "field" missing');
        }

        // check 'id' and default to 'field'
        if (empty($options['id'])) {
            if (is_array($options['field'])) {
                throw new Exception('Option "id" is required when option "field" is an array');
            } else {
                $options['id'] = $options['field'];
            }
        }


        // get validator
        if (is_string($options['validator'])) {
            $validator = array('Validators', $options['validator']);
        } else {
            $validator = $options['validator'];
        }

        // check validator
        if (!is_callable($validator)) {
            throw new Exception('Validator for field ' . $options['id'] . ' is not callable');
        }


        // return false if any errors are already registered under 'id'
        if (array_key_exists($options['id'], $this->_errors)) {
            return false;
        }


        // parse 'field' for multiple values and array paths
        if (is_array($options['field'])) {
            $value = array();
            foreach ($options['field'] AS $field_single) {
                $value[] = $this->resolveValue($field_single);
            }

            // skip validation for empty fields that aren't required
            if (!$options['required'] && !count(array_filter($value))) {
                return true;
            }
        } else {
            $value = $this->resolveValue($options['field']);

            // skip validation for empty fields that aren't required
            if (!$options['required'] && empty($value)) {
                return true;
            }
        }


        // call validator
        $isValid = call_user_func($validator, $value, $options);

        if ($isValid == false) {
            if (!empty($options['errorMessage'])) {
                $this->_errors[$options['id']] = gettext($options['errorMessage']);
            } else {
                // default 'errorMessage' built from 'id'
                $this->_errors[$options['id']] = sprintf($options['required'] && empty($value) ? _('%s is missing.') :  _('%s is invalid.'), Inflector::spacifyCaps($options['id']));
            }
            return false;
        } else {
            return true;
        }
    }



    // protected instance methods
    protected function resolveValue($path)
    {
        // break apart path
        $crumbs = explode('.', $path);

        // resolve path recursively
        $cur = &$this->_record;
        while ($crumb = array_shift($crumbs)) {
            if (array_key_exists($crumb, $cur)) {
                $cur = &$cur[$crumb];
            } else {
                return null;
            }
        }

        // return current value
        return $cur;
    }



    // protected static methods
    protected static function trimArray(&$array)
    {
        foreach ($array AS &$var) {
            if (is_string($var)) {
                $var = trim($var);
            } elseif (is_array($var)) {
                self::trimArray($var);
            }
        }
    }
}