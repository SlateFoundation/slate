<?php

namespace Slate\Integrations;

abstract class AbstractRequestHandler extends \RequestHandler implements IRequestHandler
{
    static public $title;

    static public $accountLevelSync = 'Administrator';

    static public function getTitle()
    {
        return static::$title ? static::$title : get_called_class();
    }

    static public function handleRequest()
    {
        // read request/response configuration
        $pretend = !empty($_REQUEST['pretend']);
        $verbose = !empty($_REQUEST['verbose']);

        if (static::peekPath() == 'json' || static::peekPath() == 'text') {
            static::$responseMode = static::shiftPath();
        }

        if ($jobHandle = static::shiftPath()) {
            if (!$Job = SynchronizationJob::getByHandle($jobHandle)) {
                return static::throwNotFoundError('Job not found');
            }

            if (static::$accountLevelSync) {
                $GLOBALS['Session']->requireAccountLevel(static::$accountLevelSync);
            }

            if (static::peekPath() == 'log') {
                $logFilename = static::getLogFilename($Job) . '.bz2';

                if (file_exists($logFilename)) {
                    header('Content-Type: application/json');
                    header(sprintf('Content-Disposition: attachment; filename="%s-%u.json"', $Job->Integrator, $Job->ID));
                    passthru("bzcat $logFilename");
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
            $TemplateJob = SynchronizationJob::getByHandle($_REQUEST['template']);

            if (!$TemplateJob || $TemplateJob->Status != 'Template' || $TemplateJob->Integrator != get_called_class()) {
                return static::throwNotFoundError('Template job not found');
            }

            $Job = SynchronizationJob::create(array(
                'Integrator' => $TemplateJob->Integrator
                ,'Template' => $TemplateJob
                ,'Config' => $TemplateJob->Config
            ));
        } else {
            if (static::$accountLevelSync) {
                $GLOBALS['Session']->requireAccountLevel(static::$accountLevelSync);
            }

            $Job = SynchronizationJob::create(array(
                'Integrator' => get_called_class()
                ,'Config' => array(
                    'reportTo' => !empty($_REQUEST['reportTo']) ? $_REQUEST['reportTo'] : null
                )
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
                ,'templates' => SynchronizationJob::getAllByWhere(array(
                    'Status' => 'Template'
                    ,'Integrator' => get_called_class()
                ))
            ));
        }


        // save job in pending state before starting
        if (!$pretend) {
            $Job->save();
        }


        // close connection to client
        if (!empty($_REQUEST['fork'])) {
            header('Location: '.static::_getScriptBaseUrl(true).'/'.$Job->Handle, true, 201);
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

            // write to log
            $logDirectory = static::getLogDirectory();
            if (!is_dir($logDirectory)) {
                mkdir($logDirectory, 0777, true);
            }

            $logFilename = static::getLogFilename($Job);
            file_put_contents($logFilename, json_encode($Job->log));
            exec("bzip2 $logFilename");

            // email report
            if (!empty($Job->Config['reportTo'])) {
                \Emergence\Mailer\Mailer::sendFromTemplate($Job->Config['reportTo'], 'syncComplete', array(
                    'Job' => $Job
                    ,'scriptBaseUrl' => static::_getScriptBaseUrl(true)
                ));
            }
        }


        // all done, respond
        return static::respond('syncComplete', array(
            'data' => $Job
            ,'success' => $success
            ,'verbose' => $verbose
            ,'pretend' => $pretend
        ));
    }

    static public function respond($responseID, $responseData = array(), $responseMode = false)
    {
        $responseData['scriptBaseUrl'] = static::_getScriptBaseUrl();

        return parent::respond($responseID, $responseData, $responseMode);
    }

    static protected function _getScriptBaseUrl($external = false)
    {
        if ($external) {
            $url = (empty($_SERVER['HTTPS']) ? 'http' : 'https').'://'.$_SERVER['HTTP_HOST'];
        }

        $url .= '/' . preg_replace('/\.php$/i', '', join('/', \Site::$resolvedPath));
        return $url;
    }

    static public function getLogDirectory()
    {
        $logsRoot = "$_SERVER[SITE_ROOT]/site-data/synchronization-logs";

        return $logsRoot;
    }

    static public function getLogFilename(SynchronizationJob $Job)
    {
        return static::getLogDirectory() . "/$Job->ID.json";
    }
}