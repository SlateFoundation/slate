<?php

namespace Emergence\CMS\Item;

abstract class AbstractItem extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_content_items';

    // ActiveRecord configuration
    public static $tableName = 'content_items';
    public static $singularNoun = 'content item';
    public static $pluralNoun = 'content items';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = 'Emergence\CMS\Item\Text';
    public static $subClasses = array(
        'Emergence\CMS\Item\Album'
        ,'Emergence\CMS\Item\Embed'
        ,'Emergence\CMS\Item\Media'
        ,'Emergence\CMS\Item\RichText'
        ,'Emergence\CMS\Item\Text'
    );

    public static $fields = array(
        'Title' => array(
            'notnull' => false
            ,'blankisnull' => true
        )
        ,'ContentID' => array(
            'type'  => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'AuthorID' => array(
            'type'  =>  'integer'
            ,'unsigned' => true
        )
        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Draft','Published','Hidden','Deleted')
            ,'default' => 'Published'
        )
        ,'Order' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'Data' => 'serialized'
    );

    public static $relationships = array(
        'Author'    =>  array(
            'type'  =>  'one-one'
            ,'class' => 'Person'
        )
        ,'Content' =>   array(
            'type'  =>  'one-one'
            ,'class' => 'Emergence\CMS\Content'
        )
    );

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true, $createRevision = true)
    {
        // set author
        if (!$this->AuthorID) {
            $this->Author = $_SESSION['User'];
        }

        // call parent
        parent::save($deep, $createRevision);
    }


    abstract public function renderBody();
}