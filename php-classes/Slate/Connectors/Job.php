<?php

namespace Slate\Connectors;

use ActiveRecord;
use HandleBehavior;

class Job extends ActiveRecord
{
    public $log;

    // ActiveRecord configuration
    public static $tableName = 'connector_jobs';
    public static $singularNoun = 'connector job';
    public static $pluralNoun = 'connector jobs';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
        'Title'
        ,'Handle' => array(
            'unique' => true
        )

        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Template','Pending','InProgress','Completed','Failed','Abandoned')
            ,'default' => 'Pending'
        )

        ,'Connector'
        ,'TemplateID' => array(
            'type' => 'uint'
            ,'notnull' => false
        )

        ,'Direction' => array(
            'type' => 'enum'
            ,'values' => array('In','Out','Both')
            ,'notnull' => false
        )

        ,'Config' => array(
            'type' => 'json'
        )
        ,'Results' => array(
            'type' => 'json'
        )
    );

    public static $relationships = array(
        'Template' => array(
            'type' => 'one-one'
            ,'class' => __CLASS__
        )
        ,'TemplatedJobs' => array(
            'type' => 'one-many'
            ,'class' => __CLASS__
            ,'foreign' => 'TemplateID'
            ,'order' => array('ID' => 'DESC')
        )
    );


    public function save($deep = true)
    {
        // set handle
        if (!$this->Handle) {
            $this->Handle = HandleBehavior::generateRandomHandle($this);
        }

        // call parent
        return parent::save();
    }

    public function getConnectorTitle()
    {
        $className = $this->Connector;
        return $className::getTitle();
    }

    public function log($message, $level = LOG_INFO)
    {
        $this->log[] = array(
            'level' => $level
            ,'message' => $message
        );
    }

    public function logRecordDelta(ActiveRecord $Record, $options = array())
    {
        $ignoreFields = is_array($options['ignoreFields']) ? $options['ignoreFields'] : array();
        $fieldRenderers = is_array($options['fieldRenderers']) ? $options['fieldRenderers'] : array();
        $messageRenderer = is_callable($options['messageRenderer']) ? $options['messageRenderer'] : function($logEntry) { return "{$logEntry[action]} ".$logEntry['record']->getTitle(); };

        $logEntry = array(
            'changes' => array()
            ,'level' => array_key_exists('level', $options) ? $options['level'] : LOG_INFO
            ,'record' => &$Record
        );

        foreach ($Record->originalValues AS $field => $from) {
            if (in_array($field, $ignoreFields)) {
                continue;
            }

            $to = $Record->getValue($field);

            if (is_callable($fieldRenderers[$field])) {
                $from = call_user_func($fieldRenderers[$field], $from, $Record, $field, 'from');
                $to = call_user_func($fieldRenderers[$field], $to, $Record, $field, 'to');
            }

            $logEntry['changes'][$field] = array(
                'from' => $from
                ,'to' => $to
            );
        }

        if ($Record->isPhantom || $Record->isNew) {
            $logEntry['action'] = 'create';
        } elseif ($Record->isDirty && count($logEntry['changes'])) {
            $logEntry['action'] = 'update';
        } else {
            return;
        }

        $logEntry['message'] = call_user_func($messageRenderer, $logEntry);

        return $this->log[] = $logEntry;
    }

    public function logInvalidRecord(\ActiveRecord $Record)
    {
        $this->log[] = array(
            'message' => 'Invalid ' . get_class($Record) . ' record: ' . $Record->getTitle()
            ,'validationErrors' => $Record->validationErrors
        );
    }

    public function logException(\Exception $e)
    {
        $this->log[] = array(
            'message' => get_class($e) . ': ' . $e->getMessage()
            ,'exception' => $e
        );
    }

    public function getLogPath()
    {
        return $this->isPhantom ? null : \Site::$rootPath . '/site-data/connector-jobs/' . $this->ID . '.json';
    }

    public function writeLog()
    {
        $logPath = $this->getLogPath();
        $logDirectory = dirname($logPath);

        if (!is_dir($logDirectory)) {
            mkdir($logDirectory, 0777, true);
        }

        file_put_contents($logPath, json_encode($this->log));
        exec("bzip2 $logPath");
    }
}