<?php

class CommentActivity extends Activity
{
    
    public static $relationships = array(
        'Media' => array(
            'type' => 'context-children',
            'class' => 'PhotoMedia',
            'contextClass' => __CLASS__,
        )    
    );
    
    public static $dynamicFields = array(
        'Media'    
    );
    
    public function getChanges()
    {
        if ($this->Verb == 'update') {
            return $this->Data;
        }
    }
    
}