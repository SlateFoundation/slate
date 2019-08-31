<?php

class PasswordToken extends Token
{
    public static $emailTemplate = 'register/passwordToken';
    public static $formTemplate = 'register/passwordForm';

    public function handleRequest($data)
    {
        parent::handleRequest($data);

        if (empty($data['Password'])) {
            throw new Exception('Enter a new password for your account');
        } elseif ($data['Password'] != $data['PasswordConfirm']) {
            throw new Exception('Enter your new password twice for confirmation');
        }

        $this->Creator->setClearPassword($data['Password']);
        $this->Creator->save();

        // set used
        $this->Used = time();
        $this->save();

        return RequestHandler::respond('register/passwordRecovered');
    }
}