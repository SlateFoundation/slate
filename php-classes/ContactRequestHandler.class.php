<?php

class ContactRequestHandler extends RequestHandler
{
    public static $emailTo;
    public static $validators = array();
    public static $formatters = array();
    public static $excludeFields = array('path');
    public static $accountLevelBrowse = 'Administrator';

    public static $userResponseModes = array(
        'application/json' => 'json',
        'text/csv' => 'csv'
    );

    public static function handleRequest()
    {
        // handle JSON requests
        switch (static::peekPath()) {
            case 'json':
                static::$responseMode = static::shiftPath();
                break;
            case 'submissions':
                return static::handleSubmissionsRequest();
        }

        // route request
        return static::handleContactRequest();
    }


    public static function handleContactRequest()
    {
        // get optional subform name
        $subform = static::shiftPath();

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            // validate
            $Validator = new RecordValidator($_REQUEST);

            foreach (static::$validators AS $validatorConfig) {
                // execute callable validator
                if (is_callable($validatorConfig)) {
                    $validatorConfig($Validator, $subform);
                } else {
                    if (
                        !empty($validatorConfig['subforms'])
                        && is_array($validatorConfig['subforms'])
                        && (!$subform || !in_array($subform, $validatorConfig['subforms']))
                    ) {
                        // skip if validator specific to other subforms
                        continue;
                    }

                    $Validator->validate($validatorConfig);
                }
            }

            if (!$Validator->hasErrors()) {
                // save to database
                $Submission = new ContactSubmission::$defaultClass();
                $Submission->Data = array_diff_key($_REQUEST, array_flip(static::$excludeFields));
                $Submission->Subform = $subform;
                $Submission->save();

                // generate email report
                if (!empty(static::$emailTo)) {
                    $headers = array();
                    if (!empty($_REQUEST['Email']) && Validators::email($_REQUEST['Email'])) {
                        $headers['Reply-To'] = $_REQUEST['Email'];
                    }

                    Emergence\Mailer\Mailer::sendFromTemplate(static::$emailTo, 'staffNotice', array(
                        'Submission' => $Submission
                        ,'formatters' => static::$formatters
                    ), array(
                        'Headers' => $headers
                    ));
                }

                // respond success
                return static::respond('contactSubmitted', array(
                    'success' => true
                    ,'subform' => $subform
                ));
            }
        }

        return static::respond('contact', array(
            'validationErrors' => isset($Validator) ? $Validator->getErrors() : array()
            ,'subform' => $subform
        ));
    }
    
    public static function handleSubmissionsRequest()
    {
        $GLOBALS['Session']->requireAccountLevel(static::$accountLevelBrowse);

        return static::respond('submissions', array(
            'data' => ContactSubmission::getAll(array('order' => array('ID' => 'DESC')))
        ));
    }
}