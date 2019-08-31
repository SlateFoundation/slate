<?php

class PasswordAuthenticator extends Authenticator
{
    // configurable settings
    public static $requestContainer = '_LOGIN';


    public function __construct(UserSession $Session)
    {
        // require UserSession instead of Session
        parent::__construct($Session);
    }


    /**
     * Check if an authentication request exists and
     * attempt authentication if it does
     * @return bool $success
     */
    public function checkAuthentication()
    {
        if (isset($this->_authenticatedPerson)) {
            return true;
        }

        // resolve AuthRequest from PostContainer
        if (static::$requestContainer) {
            if (isset($_REQUEST[static::$requestContainer])) {
                $requestData = &$_REQUEST[static::$requestContainer];
            } else {
                $requestData = [];
            }
        } else {
            $requestData = &$_POST;
        }

        // check for authentication request
        if (isset($requestData['username']) && isset($requestData['password'])) {
            $this->_authenticatedPerson = $this->attemptAuthentication($requestData['username'], $requestData['password']);

            if ($this->_authenticatedPerson) {
                Emergence\EventBus::fireEvent('personAuthenticate', 'Emergence/People', [
                    'Person' => $this->_authenticatedPerson,
                    'requestData' => $requestData,
                    'authenticatorClass' => get_called_class()
                ]);

                // redirect if original request was GET
                if ($requestData['returnMethod'] != 'POST' && $_SERVER['REQUEST_METHOD'] != 'GET') {
                    Site::redirect($_SERVER['REQUEST_URI']);
                }

                return true;
            } else {
                $this->respondLoginPrompt(new PasswordAuthenticationFailedException(_('The username or password you entered was incorrect.')));
                return false;
            }
        }

        return false;
    }


    /**
     * Get Person object for authenticated person
     * @return Person $AuthenticatedPerson
     */
    protected function getAuthenticatedPerson()
    {
        // check if session is already authenticated
        if (isset($this->_authenticatedPerson)) {
            return $this->_authenticatedPerson;
        } elseif ($this->_session->PersonID) {
            return Person::getByID($this->_session->PersonID);
        } else {
            return null;
        }
    }


    /**
     * Attempt password authentication and retieve Person
     * @return Person $AuthenticatedPerson
     * @param object $username
     * @param object $password
     */
    protected function attemptAuthentication($username, $password)
    {
        $userClass = User::$defaultClass;
        if (!$User = $userClass::getByLogin($username, $password)) {
            return null;
        }

        $this->_session = $this->_session->changeClass(UserSession::class, [
            'PersonID' => $User->ID
        ]);

        return $User;
    }


    /**
     * Check authentication, render login form, and block access
     * @return bool $success
     * @param object $options[optional]
     */
    public function requireAuthentication()
    {
        // authentication saved in session
        if ($this->_session->PersonID) {
            return true;
        }

        // try to read password authentication
        try {
            $success = $this->checkAuthentication();
        } catch (PasswordAuthenticationFailedException $e) {
            // print login page
            $this->respondLoginPrompt($e);
            return false;
        }

        if (!$success) {
            $this->respondLoginPrompt();
        }

        return $success;
    }


    /**
     * Print login page and exit
     * @return nothing
     * @param object $AuthException[optional]
     */
    public function respondLoginPrompt($authException = false)
    {
        if (
            (!empty(Site::$pathStack[0]) && Site::$pathStack[0] == 'json')
            || (!empty($_REQUEST['format']) && $_REQUEST['format'] == 'json')
            || (!empty($_SERVER['HTTP_ACCEPT']) && $_SERVER['HTTP_ACCEPT'] == 'application/json')
        ) {
            RequestHandler::$responseMode = 'json';
        }

        header('HTTP/1.1 401 Unauthorized');

        $postVars = $_POST;
        unset($postVars[static::$requestContainer]);

        RequestHandler::respond('login/login', [
            'success' => false,
            'loginRequired' => true,
            'requestContainer' => static::$requestContainer,
            'error' => $authException ? $authException->getMessage() : false,
            'postVars' => $postVars
        ]);
    }
}
