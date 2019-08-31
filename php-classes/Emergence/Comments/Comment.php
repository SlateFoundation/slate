<?php

namespace Emergence\Comments;

use ActiveRecord;
use HandleBehavior;


class Comment extends \VersionedRecord
{
    // support subclassing
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    // ActiveRecord configuration
    public static $tableName = 'comments';
    public static $singularNoun = 'comment';
    public static $pluralNoun = 'comments';
    public static $collectionRoute = '/comments';

    public static $fields = array(
        'ContextClass'
        ,'ContextID' => 'uint'
        ,'Handle' => array(
            'unique' => true
        )
        ,'ReplyToID' => array(
            'type' => 'uint'
            ,'notnull' => false
        )
        ,'Message' => array(
            'type' => 'clob'
            ,'fulltext' => true
        )
    );

    public static $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
        )
        ,'ReplyTo' => array(
            'type' => 'one-one'
            ,'class' => __CLASS__
        )
    );

    public static $validators = array(
        'Context' => array(
            'validator' => 'require-relationship',
            'required' => true
        ),
        'Message' => array(
            'validator' => 'string_multiline',
            'errorMessage' => 'You must provide a message.'
        )
    );

    public static $searchConditions = array(
        'Message' => array(
            'qualifiers' => array('any','message')
        )
    );

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // set handle
        if (!$this->Handle) {
            $this->Handle = HandleBehavior::generateRandomHandle(__CLASS__, 12);
        }

        parent::save();
    }

    /**
     * Differentially apply a complete array of new comments data to a given context
     */
    public static function applyCommentsData(ActiveRecord $Context, array $commentsData)
    {
        // index existing comment records by ID
        $existingComments = [];

        foreach ($Context->Comments as $Comment) {
            $existingComments[$Comment->ID] = $Comment;
        }


        // create new and update existing comment
        $comments = [];
        foreach ($commentsData as $commentData) {
            if (empty($commentData['Message'])) {
                throw new Exception('Comment data must have Message set');
            }

            if (
                !empty($commentData['ID'])
                && ($Comment = $existingComments[$commentData['ID']])
            ) {
                $Comment->Message = $commentData['Message'];
            } else {
                $Comment = static::create([
                    'Message' => $commentData['Message']
                ]);
            }

            $comments[] = $Comment;
        }


        // write new list to relationship
        $Context->Comments = array_merge($existingComments, $comments);
    }
}
