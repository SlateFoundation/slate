<?php

use Emergence\People\Person;
use Emergence\People\User;

class UserSession extends Session
{
     // ActiveRecord configuration
    public static $subClasses = [
        Session::class,
        __CLASS__
    ];

    public static $fields = [
        'PersonID' => 'uint'
    ];

    public static $relationships = [
        'Person' => [
            'type' => 'one-one',
            'class' => Person::class
        ]
    ];

    public static $dynamicFields = [
        'Person'
    ];


    // UserSession
    public static $requireAuthentication = false;
    public static $defaultAuthenticator = PasswordAuthenticator::class;

    public $authenticator;

    public function __construct(array $record = [])
    {
         parent::__construct($record);

        if (!isset($this->authenticator)) {
            $this->authenticator = new static::$defaultAuthenticator($this);
        }

        // check authentication
        $this->authenticator->checkAuthentication();

        // require authentication ?
        if (static::$requireAuthentication && !$this->requireAuthentication()) {
            throw new AuthenticationFailedException();
        }

        // export data to _SESSION superglobal
        $_SESSION['User'] = $this->Person ? $this->Person : false;
    }

    public function requireAuthentication()
    {
        return $this->authenticator->requireAuthentication();
    }

    public function requireAccountLevel($accountLevel)
    {
        $this->requireAuthentication();

        if (!is_a($this->Person, User::class) || !$this->Person->hasAccountLevel($accountLevel)) {
            ErrorHandler::handleInadaquateAccess($accountLevel);
            exit();
        }
    }

    public function hasAccountLevel($accountLevel)
    {
        return $this->Person && $this->Person->hasAccountLevel($accountLevel);
    }
}
