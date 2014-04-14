<?php

namespace Slate\Integrations;

use ActiveRecord;

class SynchronizationJob extends ActiveRecord
{
    public $log;

    // ActiveRecord configuration
    static public $tableName = 'synchronization_jobs';
    static public $singularNoun = 'synchronization job';
    static public $pluralNoun = 'synchronization jobs';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static public $fields = array(
        'Title'
        ,'Handle' => array(
            'unique' => true
        )

        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Template','Pending','InProgress','Completed','Failed','Abandoned')
            ,'default' => 'Pending'
        )

        ,'Integrator'
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

    static public $relationships = array(
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

    static public function getByHandle($handle)
    {
        return static::getByField('Handle', $handle, true);
    }

    public function save($deep = true)
    {
        // set handle
        if (!$this->Handle) {
            $this->Handle = static::generateRandomHandle();
        }

        // call parent
        return parent::save();
    }

    public function getIntegratorTitle()
    {
        $className = $this->Integrator;
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
        $messageRenderer = is_callable($options['messageRenderer']) ? $options['messageRenderer'] : function($logEntry) { return "{$logEntry[action]} {$logEntry[record]->Class} #{$logEntry[record]->ID}"; };

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

    public function logException(Exception $e)
    {
        $this->log[] = array(
            'message' => get_class($e) . ': ' . $e->getMessage()
            ,'exception' => $e
        );
    }
}