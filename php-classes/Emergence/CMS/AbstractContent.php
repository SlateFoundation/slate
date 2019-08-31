<?php

namespace Emergence\CMS;

use ActiveRecord;
use Emergence\People\IPerson;
use HandleBehavior;
use JSON;

abstract class AbstractContent extends \VersionedRecord
{
    // ActiveRecord configuration
    public static $tableName = 'content';
    public static $singularNoun = 'content';
    public static $pluralNoun = 'contents';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array('Emergence\CMS\Page', 'Emergence\CMS\BlogPost');

    public static $searchConditions = array(
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

    public static $fields = array(
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
            ,'index' => true
        )
        ,'Visibility' => array(
            'type' => 'enum'
            ,'values' => array('Public','Private')
            ,'default' => 'Public'
        )
        ,'Summary' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
    );


    public static $relationships = array(
        'Context' => array(
            'type' => 'context-parent'
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
            ,'class' => 'Emergence\Comments\Comment'
            ,'order' => array('ID' => 'DESC')
        )
    );

    public static $dynamicFields = array(
        'tags' => 'Tags'
        ,'items' => 'Items'
        ,'Author'
        ,'Context'
    );


    public function userCanReadRecord(IPerson $User = null)
    {
        $User = $User ?: $this->getUserFromEnvironment();

        // author and staff can always read
        if ($User && ($User->ID == $this->AuthorID || $User->hasAccountLevel('Staff'))) {
            return true;
        }

        // only above exempted users can view non-published content
        if ($this->Status != 'Published') {
            return false;
        }

        // only logged-in users can view non-public content
        if ($this->Visibility != 'Public' && (!$User || !$User->hasAccountLevel('User'))) {
            return false;
        }

        return true;
    }

    public static function getAllPublishedByContextObject(ActiveRecord $Context, $options = array())
    {
        $options = array_merge(array(
            'conditions' => array(),
            'order' => array('Published' => 'DESC')
        ), $options);

        if (empty($GLOBALS['Session']) || !$GLOBALS['Session']->Person) {
            $options['conditions']['Visibility'] = 'Public';
        }

        $options['conditions']['Status'] = 'Published';
        $options['conditions'][] = 'Published IS NULL OR Published <= CURRENT_TIMESTAMP';

        if (get_called_class() != __CLASS__) {
            $options['conditions']['Class'] = get_called_class();
        }

        return static::getAllByContextObject($Context, $options);
    }

    public static function getAllPublishedByAuthor(IPerson $Author, $options = array())
    {
        $options = array_merge(array(
            'conditions' => array(),
            'order' => array('Published' => 'DESC')
        ), $options);

        if (empty($GLOBALS['Session']) || !$GLOBALS['Session']->Person) {
            $options['conditions']['Visibility'] = 'Public';
        }

        $options['conditions']['AuthorID'] = $Author->ID;
        $options['conditions']['Status'] = 'Published';
        $options['conditions'][] = 'Published IS NULL OR Published <= CURRENT_TIMESTAMP';

        if (get_called_class() != __CLASS__) {
            $options['conditions']['Class'] = get_called_class();
        }

        return static::getAllByWhere($options['conditions'], $options);
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
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // set author
        if (!$this->AuthorID && !empty($_SESSION) && !empty($_SESSION['User'])) {
            $this->Author = $_SESSION['User'];
        }

        // set published
        if (!$this->Published && $this->Status == 'Published') {
            $this->Published = time();
        }

        // implement handles
        HandleBehavior::onSave($this);

        // call parent
        parent::save($deep);
    }

    public function renderBody()
    {
        return join('', array_map(function($Item) {
            return $Item->renderBody();
        }, $this->Items));
    }
}
