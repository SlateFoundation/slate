<?php

abstract class Authenticator
{
    // abstract functions
    abstract public function requireAuthentication();
    abstract public function checkAuthentication();
    abstract protected function getAuthenticatedPerson();

    // protected
    protected $_session;
    protected $_authenticatedPerson;

    public function __construct(Session $Session)
    {
        // store session
        $this->_session = $Session;
    }

    public function __get($name)
    {
        switch ($name) {
            case 'Session':
                return $this->_session;

            case 'AuthenticatedPerson':
                if (!isset($this->_authenticatedPerson)) {
                    $this->_authenticatedPerson = $this->getAuthenticatedPerson();
                }

                return $this->_authenticatedPerson;

            default:
                return null;
        }
    }
}
