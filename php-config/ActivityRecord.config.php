<?php

ActivityRecord::$relationships['Activities'] = array(
    'type' => 'one-many'
	,'class' => 'Activity'
	,'foreign' => 'ActorID'
	,'conditions' => array(
		'ActorClass' => ActivityRecord::getStaticRootClass()	
	)
	,'order' => array('ID' => 'DESC') 	
);

ActivityRecord::$dynamicFields = array(
    'Stories' => array(
        'method' => function($Record) {
            return $Record->getStories();
        }    
    )    
);