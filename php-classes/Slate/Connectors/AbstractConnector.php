<?php

namespace Slate\Connectors;

abstract class AbstractConnector extends \RequestHandler implements IConnector
{
    public static $title;
    public static $connectorId;
    public static $accountLevelSynchronize = 'Administrator';

    public static function getTitle()
    {
        return static::$title ? static::$title : get_called_class();
    }

    public static function getConnectorId()
    {
        return static::$connectorId ? static::$connectorId : get_called_class();
    }

    public static function handleRequest($action = null)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'synchronize':
                if (!is_a(get_called_class(), 'Slate\Connectors\ISynchronize', true)) {
                    return static::throwError('Connector does not implement synchronize');
                }
                
                return static::handleSynchronizeRequest();
            case '':
            case false:
                return static::handleConnectorRequest();
            default:
                return static::throwInvalidRequestError();
        }
    }
    
    public static function handleConnectorRequest()
    {
        return static::respond('connector', array(
            'class' => get_called_class(),
            'title' => static::getTitle()
        ));
    }
        
    public static function handleSynchronizeRequest()
    {
        // read request/response configuration
        $pretend = !empty($_REQUEST['pretend']);
        $verbose = !empty($_REQUEST['verbose']);

        if (static::peekPath() == 'json' || static::peekPath() == 'text') {
            static::$responseMode = static::shiftPath();
        }

        if ($jobHandle = static::shiftPath()) {
            if (!$Job = Job::getByHandle($jobHandle)) {
                return static::throwNotFoundError('Job not found');
            }

            if (static::$accountLevelSynchronize) {
                $GLOBALS['Session']->requireAccountLevel(static::$accountLevelSynchronize);
            }

            if (static::peekPath() == 'log') {
                $logPath = $Job->getLogPath() . '.bz2';

                if (file_exists($logPath)) {
                    header('Content-Type: application/json');
                    header(sprintf('Content-Disposition: attachment; filename="%s-%u.json"', $Job->Connector, $Job->ID));
                    passthru("bzcat $logPath");
                    exit();
                } else {
                    return static::throwNotFoundError('Log not available');
                }
            }

            return static::respond('jobStatus', array(
                'data' => $Job
            ));
        }

        // authenticate and create job or copy template
        if (!empty($_REQUEST['template'])) {
            $TemplateJob = Job::getByHandle($_REQUEST['template']);

            if (!$TemplateJob || $TemplateJob->Status != 'Template' || $TemplateJob->Connector != get_called_class()) {
                return static::throwNotFoundError('Template job not found');
            }

            $Job = Job::create(array(
                'Connector' => $TemplateJob->Connector
                ,'Template' => $TemplateJob
                ,'Config' => $TemplateJob->Config
            ));
        } else {
            if (static::$accountLevelSynchronize) {
                $GLOBALS['Session']->requireAccountLevel(static::$accountLevelSynchronize);
            }

            $Job = Job::create(array(
                'Connector' => get_called_class()
                ,'Config' => static::_getJobConfig($_REQUEST)
            ));

            if (!empty($_REQUEST['createTemplate'])) {
                if ($pretend) {
                    return static::throwInvalidRequestError('Cannot combine pretend and createTemplate');
                }

                $Job->Status = 'Template';
                $Job->save();

                return static::respond('templateCreated', array(
                    'data' => $Job
                ));
            }
        }

        // show template if not a post
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('createJob', array(
                'data' => $Job
                ,'templates' => Job::getAllByWhere(array(
                    'Status' => 'Template'
                    ,'Connector' => get_called_class()
                ))
            ));
        }


        // save job in pending state before starting
        if (!$pretend) {
            $Job->save();
        }


        // close connection to client
        if (!empty($_REQUEST['fork'])) {
            header('Location: '.static::_getConnectorBaseUrl(true).'/'.$Job->Handle, true, 201);
            print(json_encode(array('data' => $Job->getData())));
            fastcgi_finish_request();
        }


        // execute synchronization
        try {
            $success = static::synchronize($Job, $pretend, $verbose);
        } catch(Exception $e) {
            $Job->logException($e);
            $success = false;
        }

        if (!$success) {
            $Job->Status = 'Failed';
        }


        // save job if not pretend
        if (!$pretend) {
            $Job->save();
            $Job->writeLog();

            // email report
            if (!empty($Job->Config['reportTo'])) {
                \Emergence\Mailer\Mailer::sendFromTemplate($Job->Config['reportTo'], 'syncronizeComplete', array(
                    'Job' => $Job
                    ,'connectorBaseUrl' => static::_getConnectorBaseUrl(true)
                ));
            }
        }


        // all done, respond
        return static::respond('syncronizeComplete', array(
            'data' => $Job
            ,'success' => $success
            ,'verbose' => $verbose
            ,'pretend' => $pretend
        ));
    }

    public static function respond($responseID, $responseData = array(), $responseMode = false)
    {
        $responseData['connectorBaseUrl'] = static::_getConnectorBaseUrl();

        return parent::respond($responseID, $responseData, $responseMode);
    }

    protected static function _getConnectorBaseUrl($external = false)
    {
        if ($external) {
            $url = (empty($_SERVER['HTTPS']) ? 'http' : 'https').'://'.$_SERVER['HTTP_HOST'];
        }

        $url .= '/' . preg_replace('/\.php$/i', '', join('/', \Site::$resolvedPath));
        return $url;
    }

    protected static function _getJobConfig(array $requestData)
    {
        return array(
            'reportTo' => !empty($requestData['reportTo']) ? $requestData['reportTo'] : null
        );
    }
}