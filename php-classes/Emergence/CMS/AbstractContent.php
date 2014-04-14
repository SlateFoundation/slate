<?php

namespace Emergence\CMS;

use ActiveRecord;
use Person;
use GlobalHandleBehavior;
use JSON;

abstract class AbstractContent extends \VersionedRecord
{
    // VersionedRecord configuration
    static public $historyTable = 'history_content';

    // ActiveRecord configuration
    static public $tableName = 'content';
    static public $singularNoun = 'content';
    static public $pluralNoun = 'contents';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array('Emergence\CMS\Page', 'Emergence\CMS\BlogPost');

    static public $searchConditions = array(
        'Title' => array(
            'qualifiers' => array('any', 'title')
            ,'points' => 2
            ,'sql' => 'Title Like "%%%s%%"'
        )
        ,'Handle' => array(
            'qualifiers' => array('any', 'handle')
            ,'points' => 2
            ,'sql' => 'Handle Like "%%%s%%"'
        )
    );

    static public $fields = array(
        'ContextClass' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'ContextID' => array(
            'type' => 'uint'
            ,'notnull' => false
        )
        ,'Title'
        ,'Handle' => array(
            'unique' => true
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
        ,'Published' => array(
            'type'  =>  'timestamp'
            ,'notnull' => false
        )
        ,'Visibility' => array(
            'type' => 'enum'
            ,'values' => array('Public','Private')
            ,'default' => 'Public'
        )
    );


    static public $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
        )
        ,'GlobalHandle' => array(
            'type' => 'handle'
        )
        ,'Author' =>  array(
            'type' =>  'one-one'
            ,'class' => 'Person'
        )
        ,'Items' => array(
            'type' => 'one-many'
            ,'class' => 'Emergence\CMS\Item\AbstractItem'
            ,'foreign' => 'ContentID'
            ,'conditions' => 'Status != "Deleted"'
            ,'order' => array('Order','ID')
        )
        ,'Tags' => array(
            'type' => 'many-many'
            ,'class' => 'Tag'
            ,'linkClass' => 'TagItem'
            ,'linkLocal' => 'ContextID'
            ,'conditions' => array('Link.ContextClass = "Emergence\\\\CMS\\\\AbstractContent"')
        )
        ,'Comments' => array(
            'type' => 'context-children'
            ,'class' => 'Comment'
            ,'order' => array('ID' => 'DESC')
        )
    );

    static public $dynamicFields = array(
        'tags' => 'Tags'
        ,'items' => 'Items'
        ,'Author'
    );


    static public function getAllPublishedByContextObject(ActiveRecord $Context, $options = array())
    {
        $options = \MICS::prepareOptions($options, array(
            'conditions' => array()
            ,'order' => array('Published' => 'DESC')
        ));

        if (!$GLOBALS['Session']->Person) {
            $options['conditions']['Visibility'] = 'Public';
        }

        $options['conditions']['Status'] = 'Published';
        $options['conditions'][] = 'Published IS NULL OR Published <= CURRENT_TIMESTAMP';

        if (get_called_class() != __CLASS__) {
            $options['conditions']['Class'] = get_called_class();
        }

        return static::getAllByContextObject($Context, $options);
    }

    static public function getAllPublishedByAuthor(Person $Author, $options = array())
    {
        $options = \MICS::prepareOptions($options, array(
            'order' => array('Published' => 'DESC')
        ));

        $conditions = array(
            'AuthorID' => $Author->ID
            ,'Status' => 'Published'
            ,'Published IS NULL OR Published <= CURRENT_TIMESTAMP'
        );

        if (get_called_class() != __CLASS__) {
            $conditions['Class'] = get_called_class();
        }

        return static::getAllByWhere($conditions, $options);
    }

    static public function getByHandle($handle)
    {
        return static::getByField('Handle', $handle, true);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate(array(
            'field' => 'Title'
            ,'errorMessage' => 'A title is required'
        ));

        // implement handles
        GlobalHandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true, $createRevision = true)
    {
        // set author
        if (!$this->AuthorID) {
            $this->Author = $_SESSION['User'];
        }

        // set published
        if (!$this->Published && $this->Status == 'Published') {
            $this->Published = time();
        }

        // implement handles
        GlobalHandleBehavior::onSave($this, $this->Title);

        // call parent
        parent::save($deep, $createRevision);
    }

    public function renderBody()
    {
        return join('', array_map(function($Item){
            return $Item->renderBody();
        }, $this->Items));
    }
}
