<?php



 class GroupMembership extends ActiveRecord
 {
     // ActiveRecord configuration
    public static $tableName = 'group_memberships';

     public static $fields = array(
        'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'GroupID' => array(
            'type' => 'integer'
            ,'unsigned' => true
        )
        ,'Expires' => array(
            'type' => 'timestamp'
            ,'notnull' => false
        )
        ,'Type' => array(
            'type' => 'enum'
            ,'values' => array('Member','Administrator','Owner')
        )
        ,'Rank' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
    );

     public static $relationships = array(
        'Person' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
            ,'local' => 'PersonID'
        )
        ,'Group' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
            ,'local' => 'PersonID'
        )
    );
 }