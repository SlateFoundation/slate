<?php

namespace Emergence\CMS\Item;

abstract class AbstractItem extends \VersionedRecord
{
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
        ,'Emergence\CMS\Item\Markdown'
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
        ,'Data' => 'json'
    );

    public static $relationships = array(
        'Author'    =>  array(
            'type'  =>  'one-one'
            ,'class' => 'Person'
        )
        ,'Content' =>   array(
            'type'  =>  'one-one'
            ,'class' => 'Emergence\CMS\AbstractContent'
        )
    );

    public static $validators = array(
        'Content' => 'require-relationship'
    );

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // set author
        if (!$this->AuthorID && !empty($_SESSION) && !empty($_SESSION['User'])) {
            $this->Author = $_SESSION['User'];
        }

        // call parent
        parent::save($deep);
    }


    abstract public function renderBody();
}