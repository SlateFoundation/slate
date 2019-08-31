<?php



 class ContactSubmission extends ActiveRecord
 {
     // support subclassing
    public static $rootClass = __CLASS__;
     public static $defaultClass = __CLASS__;
     public static $subClasses = array(__CLASS__);

    // ActiveRecord configuration
    public static $tableName = 'contact_submissions';
     public static $singularNoun = 'contact submission';
     public static $pluralNoun = 'contact submissions';


     public static $fields = array(
        'ContextClass' => null
        ,'ContextID' => null
        ,'Subform' => array(
            'type' => 'string'
            ,'notnull' => false
        )
        ,'Data' => 'serialized'
    );
 }