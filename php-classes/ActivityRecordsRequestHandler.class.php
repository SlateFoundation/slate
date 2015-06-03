<?php

class ActivityRecordsRequestHandler extends RecordsRequestHandler
{
    public static $recordClass = ActivityRecord::class;
    
    public static function handleRecordRequest(ActiveRecord $Record, $action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'activity':
            {
                return static::handleActivityRequest($Record);
            }
            default:
                return parent::handleRecordRequest($Record, $action);
        }
    }
    
    public static function handleBrowseActivityRequest($Record, $options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        $className = 'Activity';
    	
		$limit = isset($_REQUEST['limit']) && ctype_digit($_REQUEST['limit']) ? $_REQUEST['limit'] : static::$browseLimitDefault;
		$offset = isset($_REQUEST['offset']) && ctype_digit($_REQUEST['offset']) ? $_REQUEST['offset'] : false;
		
		$options = array_merge(array(
			'limit' =>  $limit
			,'offset' => $offset
			,'order' => 'ID DESC'
		), $options);

        $conditions['ObjectClass'] = $Record->Class;
        $conditions['ObjectID'] = $Record->ID;
            
        if (!empty($_REQUEST['since_id'])) {
            $conditions[] = sprintf('ID > %u', DB::escape($_REQUEST['since_id']));
        }

        // get results
        $results = $className::getAllByWhere($conditions, $options);
        
        // generate response
    	return static::respond(
			isset($responseID) ? $responseID : ($Record::$singularNoun.'Activity')
			,array_merge($responseData, array(
				'success' => true
				,'data' => $results
				,'conditions' => $conditions
			    ,'total' => DB::foundRows()
			    ,'limit' => $options['limit']
			    ,'offset' => $options['offset']
			))
		);
    }

    public static function handleActivityRequest(ActivityRecord $Record, $action = false)
    {
        $className = static::$recordClass;

        switch ($action = $action ? $action : static::shiftPath()) {
            case 'create':
                return static::handleActivityCreateRequest($Record);
                
            default:
                return static::handleBrowseActivityRequest($Record);
        }
    }

    public static function handleActivityCreateRequest(ActivityRecord $Record)
    {
        //TODO: remove
        if ($data = JSON::getRequestData()) {
            $_REQUEST = $_REQUEST + $data;
        }
        
        //handle files upload.
        if (is_array($_FILES['mediaUpload'])) {
            
            foreach($_FILES['mediaUpload']['name'] AS $i => $filename) {
                
                if ($_FILES['mediaUpload']['error'][$i] != UPLOAD_ERR_OK) {
                    switch ($_FILES['mediaUpload']['error'][$i]) {
                        case UPLOAD_ERR_NO_FILE:
                            $noUpload = true;
                            break;

                        case UPLOAD_ERR_INI_SIZE:
                        case UPLOAD_ERR_FORM_SIZE:
                            return static::throwError('Your file exceeds the maximum upload size. Please try again with a smaller file.');

                        case UPLOAD_ERR_PARTIAL:
                            return static::throwError('Your file was only partially uploaded, please try again.');

                        default:
                            return static::throwError('There was an unknown problem while processing your upload, please try again.');
                    }
                }

                try {
                    $Media = Media::createFromUpload($_FILES['mediaUpload']['tmp_name'][$i]);
                    if ($Media)
                        $uploadedMedia[] = $Media;
                    else
                        $errors[$filename] = 'There was an error uploading this file. Please check the type, and try again.';
                    
                } catch (Exception $e) {
                    $errors[$filename] = $e->getMessage();              
                }
            }
        }
        
        //create note
        if ($_REQUEST['Note']) {
            $newActivity = CommentActivity::publish($Record, 'comment', $GLOBALS['Session']->Person, DB::escape($_REQUEST['Note']));
        
            //attach media to activity
            if (!empty($uploadedMedia)) {
                foreach ($uploadedMedia AS $media) {
                    $media->ContextClass = 'CommentActivity';
                    $media->ContextID = $newActivity->ID;
                    $media->save(false);
                }
            }
            
            
            static::respond($Record::$singularNoun.'ActivityCreated', array(
                'data' => $newActivity,
                'failed' => $errors,
                'success' => true
            ));
        } else {
            static::throwInvalidRequestError('Note required.');
        }

    }
}