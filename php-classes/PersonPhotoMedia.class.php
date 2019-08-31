<?php



 class PersonPhotoMedia extends PhotoMedia
 {
     // configurables


    // protected properties
    protected $_person;


    // magic methods
    public function __get($name)
    {
        switch ($name) {
            case 'Person':

                if (!isset($this->_person)) {
                    $this->_person = call_user_func(array(Person::$StandardClass, 'getByID'), $this->ContextID);
                }

                return $this->_person;

            default:
                return parent::__get($name);
        }
    }




    // public static methods
    public static function getByPersonID($personID)
    {
        return parent::getByContext('Person', $personID);
    }

    /*
    static public function prepareRecord($data, $recordFields = array())
    {
        if(empty($recordFields['namespace']))
        {
            $recordFields['namespace'] = self::$MediaNamespace;
        }
        
        if(empty($recordFields['context_id']))
        {
            $recordFields['context_id'] = $data['Person']->ID;
        }
        
        return parent::prepareRecord($data, $recordFields);
    }
    */
 }