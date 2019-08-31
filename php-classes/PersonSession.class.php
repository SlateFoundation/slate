<?php



 class PersonSession extends Session
 {
     // configurable settings
    public static $DefaultAuthenticator = 'PasswordAuthenticator';
     public static $DefaultRequireAuthentication = false;
     public static $PersonIDColumn = 'person_id';

    // private variables
    protected $_authenticator;
     protected $_person;

     public function __construct($options = array())
     {

        // call parent and apply additional default options
        parent::__construct(array_merge(array(
            'Authenticator' => self::$DefaultAuthenticator
            ,'RequireAuthentication' => self::$DefaultRequireAuthentication
            ,'PersonClass' => Person::$StandardClass
        ), $options));

        // initialize authenticator
        $this->_authenticator = new $this->_options['Authenticator']($this);

        // check authentication
        $this->_authenticator->checkAuthentication();

        // require authentication ?
        if ($this->_options['RequireAuthentication']) {
            if (!$this->_authenticator->requireAuthentication($this->_options)) {
                throw new AuthenticationFailedException();
            }
        }
     }

     public function __get($name)
     {
         switch ($name) {
            case 'PersonID':
                return $this->_record['person_id'];

            case 'Person':
                return $this->_authenticator->AuthenticatedPerson;

            case 'PersonClass':
                return $this->_options['PersonClass'];

            case 'Authenticator':
                return $this->_authenticator;

            default:
                return parent::__get($name);
        }
     }



    /*
     * TODO: public -> protected, and implement the damn thing
     */
    public function afterLoadUser()
    {
        //Update last login 
        db_n(sprintf(
            'UPDATE %s SET last_login = CURRENT_TIMESTAMP WHERE %s = %u'
            ,USER_TABLE
            ,UID_COLUMN
            ,$this->UserData[UID_COLUMN]
        ));
    }

     public function requireAuthentication()
     {
         return $this->_authenticator->requireAuthentication($this->_options);
     }


    /*
     * TODO: Refoctar to SecurityGuard
     */
    public function requireAccountLevel($requiredAccountLevel)
    {
        $this->Authenticator->requireAuthentication();

        if (!$this->Person->hasAccountLevel($requiredAccountLevel)) {
            ErrorHandler::handleInadaquateAccess($requiredAccountLevel);
            exit();
        }
    }
 }