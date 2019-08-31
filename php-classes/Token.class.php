<?php

abstract class Token extends ActiveRecord
{
    public static $expirationHours = 48;
    public static $emailTemplate = 'token';

    public static $tableName = 'tokens';
    public static $collectionRoute = '/tokens';

    // support subclassing
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__, 'PasswordToken');


    public static $fields = array(
        'Handle' => array(
            'type' => 'string'
            ,'unique' => true
        )
        ,'Expires' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
        ,'Used' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
    );


    public static $relationships = array(
        'Creator' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
            ,'local' => 'CreatorID'
        )
    );

    public function handleRequest($data)
    {
        // do nothing
    }

    public function getValue($name)
    {
        switch ($name) {
            case 'isExpired':
                return ($this->Expires < time());
            case 'isUsed':
                return $this->Used == true;
            default:
                return parent::getValue($name);
        }
    }

    public function save($deep = true)
    {
        // set handle
        if (!$this->Handle) {
            $this->Handle = HandleBehavior::generateRandomHandle($this);
        }

        if (!$this->Expires) {
            $this->Expires = time() + (3600*static::$expirationHours);
        }

        // call parent
        parent::save($deep);
    }

    public function sendEmail($email)
    {
        return Emergence\Mailer\Mailer::sendFromTemplate($email, static::$emailTemplate, array(
            'Token' => $this
        ));
    }
}