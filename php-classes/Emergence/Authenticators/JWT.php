<?php

namespace Emergence\Authenticators;

use UserSession;
use Firebase\JWT as JWTLib;
use Exception;
use Emergence\People\User;
use Emergence\Logger;

class JWT extends \PasswordAuthenticator
{   
    public static $secretKey;
    public static $urlParameter = 'jwt';
    
    public function __construct(UserSession $Session)
    {
        // require UserSession instead of Session
        parent::__construct($Session);
    }
    
    public static function getUserByJWT($token, $key = null, $verify = true)
    {
        if (!$key) {
            $key = self::$secretKey;
        }
        
        $jwt = JWTLib::decode($token, $key, $verify);
        $user = null;

        if ($jwt->userId) {
            $user = User::getById($jwt->userId);
        }
        
        if (!$user && $jwt->username) {
            $user = User::getByHandle($jwt->username);
        }
        
        if (!$user && $jwt->email) {
            $user = User::getByEmail($jwt->email);
        }
        
        return $user;
    }
    
    public function checkAuthentication()
    {        
        if (isset($this->_authenticatedPerson)) {
            return true;
        }
        
        if (strpos($_SERVER['HTTP_AUTHORIZATION'], 'Bearer ') === 0) {            
            $token = substr($_SERVER['HTTP_AUTHORIZATION'], 7);
        } else if (isset($_GET[self::$urlParameter])) {
            $token = $_GET[self::$urlParameter];
        }
        
        if ($token) {
            try {
                $user = static::getUserByJWT($token, self::$secretKey, true);    
            } catch (Exception $e) {
                Logger::general_warning('JWT Authenticator: ' . $e);
            }
            
            if ($user) { 
                $this->_session = $this->_session->changeClass('UserSession', ['PersonID' => $user->ID]);
                $this->_authenticatedPerson = $user;
                return true;
            }
        }
        
        return parent::checkAuthentication();
    }
}

