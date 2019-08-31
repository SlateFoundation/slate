<?php

abstract class RecordsRequestHandler extends RequestHandler
{
    // configurables
    public static $recordClass;
    public static $accountLevelRead = false;
    public static $accountLevelComment = 'User';
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = false;
    public static $browseOrder = false;
    public static $browseConditions = false;
    public static $browseLimitDefault = false;
    public static $editableFields = false;
    public static $searchConditions = false;
    public static $browseCalcFoundRows = true;

    public static $calledClass = __CLASS__;
    public static $responseMode = 'html';
    public static $userResponseModes = array(
        'application/json' => 'json'
        ,'text/csv' => 'csv'
    );

    public static function handleRequest()
    {
        // save static class
        static::$calledClass = get_called_class();

        switch (static::peekPath()) {
            case 'csv':
            case 'json':
            case 'pdf':
                static::$responseMode = static::shiftPath();
                break;
        }

        return static::handleRecordsRequest();
    }


    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'save':
            {
                return static::handleMultiSaveRequest();
            }

            case 'destroy':
            {
                return static::handleMultiDestroyRequest();
            }

            case 'create':
            {
                return static::handleCreateRequest();
            }

            case '*fields':
            {
                return static::handleFieldsRequest();
            }

            case '':
            case false:
            {
                if (count(static::getPath())) {
                    // throw an error for URLs like /collection//foo
                    return static::throwInvalidRequestError();
                }

                return static::handleBrowseRequest();
            }

            default:
            {
                try {
                    $Record = static::getRecordByHandle(urldecode($action));
                } catch (UserUnauthorizedException $e) {
                    return static::throwUnauthorizedError();
                }

                if ($Record) {
                    if (!static::checkReadAccess($Record)) {
                        return static::throwUnauthorizedError();
                    }

                    return static::handleRecordRequest($Record);
                } else {
                    return static::throwRecordNotFoundError($action);
                }
            }
        }
    }

    public static function getRecordByHandle($handle)
    {
        $className = static::$recordClass;

        if (ctype_digit($handle) || is_int($handle)) {
            return $className::getByID($handle);
        } elseif (method_exists($className, 'getByHandle')) {
            return $className::getByHandle($handle);
        } else {
            return null;
        }
    }

    public static function handleQueryRequest($query, $conditions = array(), $options = array(), $responseID = null, $responseData = array(), $mode = 'AND')
    {
        $className = static::$recordClass;
        $tableAlias = $className::getTableAlias();

        $options = array_merge(array(
            'limit' =>  !empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit']) ? $_REQUEST['limit'] : static::$browseLimitDefault
            ,'offset' => !empty($_REQUEST['offset']) && is_numeric($_REQUEST['offset']) ? $_REQUEST['offset'] : false
        ), $options);

        $select = array($tableAlias.'.*');
        $joins = array();
        $having = array();
        $matchers = array();
        $termsConditions = array();

        $parsedQuery = \Emergence\SearchStringParser::parseString($query);
        foreach ($parsedQuery AS $queryPart) {
            if ($queryPart === null || !isset($queryPart['term'])) {
                continue;
            }

            $term = $queryPart['term'];
            $qualifier = strtolower($queryPart['qualifier']) ?: 'any';

            if ($qualifier == 'mode' && $term=='or') {
                $mode = 'OR';
                continue;
            }

            $sqlSearchConditions = $className::getSqlSearchConditions($qualifier, $term);

            if (count($sqlSearchConditions['conditions']) == 0 && !$sqlSearchConditions['qualifierFound']) {
                return static::throwError('Unknown search qualifier: '.$qualifier);
            }

            $matchers = array_merge($matchers, $sqlSearchConditions['conditions']);

            if ($sqlSearchConditions['joins']) {
                $joins = array_unique(array_merge($joins, $sqlSearchConditions['joins']));
            }

            $termsConditions["$qualifier:$term"] = $sqlSearchConditions['conditions'];
        }

        if (empty($matchers)) {
            return static::throwError('Query was empty');
        }

        $select[] = join('+', array_map(function($c) {
            return sprintf('IF(%s, %u, 0)', $c['condition'], $c['points']);
        }, $matchers)).' AS searchScore';

        if ($mode == 'OR') {
            // OR mode, object can match any term and results are sorted by score
            $having[] = 'searchScore > 1';
        } else {
            // AND mode, all terms must match
            foreach ($termsConditions as $termConditions) {
                $conditions[] = '( ('.join(') OR (', array_map(function ($termCondition) {
                    return $termCondition['condition'];
                }, $termConditions)).') )';
            }
        }

        if (static::$browseOrder && empty($options['order'])) {
            $options['order'] = static::$browseOrder;
        }

        return static::respond(
            isset($responseID) ? $responseID : static::getTemplateName($className::$pluralNoun)
            ,array_merge($responseData, array(
                'success' => true
                ,'data' => $className::getAllByQuery(
                    'SELECT DISTINCT %s %s FROM `%s` %s %s WHERE (%s) %s ORDER BY %s %s'
                    ,array(
                        !empty($options['calcFoundRows']) ? 'SQL_CALC_FOUND_ROWS' : ''
                        ,join(',',$select)
                        ,$className::$tableName
                        ,$tableAlias
                        ,!empty($joins) ? implode(' ', $joins) : ''
                        ,$conditions ? join(') AND (',$className::mapConditions($conditions)) : '1'
                        ,count($having) ? 'HAVING ('.join(') AND (', $having).')' : ''
                        ,!empty($options['order']) ? 'searchScore DESC, '.join(',', $className::mapFieldOrder($options['order'])) : 'searchScore DESC'
                        ,$options['limit'] ? sprintf('LIMIT %u,%u',$options['offset'],$options['limit']) : ''
                    )
                )
                ,'query' => $query
                ,'conditions' => $conditions
                ,'total' => DB::foundRows()
                ,'limit' => $options['limit']
                ,'offset' => $options['offset']
            ))
        );
    }


    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        $className = static::$recordClass;

        if (!static::checkBrowseAccess(func_get_args())) {
            return static::throwUnauthorizedError();
        }

        try {
            $conditions = static::buildBrowseConditions($conditions, $responseData);
        } catch (OutOfBoundsException $e) {
            return static::throwNotFoundError($e->getMessage());
        } catch (UserUnauthorizedException $e) {
            return static::throwUnauthorizedError($e->getMessage());
        }

        $limit = isset($_REQUEST['limit']) && ctype_digit($_REQUEST['limit']) ? (integer)$_REQUEST['limit'] : static::$browseLimitDefault;
        $offset = isset($_REQUEST['offset']) && ctype_digit($_REQUEST['offset']) ? (integer)$_REQUEST['offset'] : false;

        if (!empty($_REQUEST['sort'])) {
            $dir = (empty($_REQUEST['dir']) || $_REQUEST['dir'] == 'ASC') ? 'ASC' : 'DESC';

            if ($className::sorterExists($_REQUEST['sort'])) {
                $order = call_user_func($className::getSorter($_REQUEST['sort']), $dir, $_REQUEST['sort']);
            } elseif ($className::fieldExists($_REQUEST['sort'])) {
                $order = array(
                    $_REQUEST['sort'] => $dir
                );
            } else {
                return static::throwError('Invalid sort field');
            }
        } else {
            $order = static::$browseOrder;
        }

        $options = array_merge(array(
            'limit' =>  $limit
            ,'offset' => $offset
            ,'order' => $order
            ,'calcFoundRows' => static::$browseCalcFoundRows
        ), $options);

        // handle query search
        if (!empty($_REQUEST['q']) && $className::$searchConditions) {
            return static::handleQueryRequest($_REQUEST['q'], $conditions, $options, $responseID, $responseData);
        }


        // get results
        $results = $className::getAllByWhere($conditions, $options);
        $resultsTotal = DB::foundRows();


        // embed tables
        if (!empty($_GET['relatedTable'])) {
            $relatedTables = is_array($_GET['relatedTable']) ? $_GET['relatedTable'] : explode(',', $_GET['relatedTable']);

            $related = array();
            foreach ($results AS $result) {
                foreach ($relatedTables AS $relName) {
                    if (!$result::relationshipExists($relName)) {
                        continue;
                    }

                    $relConfig = $result::getStackedConfig('relationships', $relName);
                    if (!$relConfig || $relConfig['type'] != 'one-one') {
                        continue;
                    }

                    $relatedInstance = $result->$relName;
                    if (!$relatedInstance) {
                        continue;
                    }

                    if (empty($related[$relName]) || !in_array($relatedInstance, $related[$relName])) {
                        $related[$relName][] = $relatedInstance;
                    }
                }
            }

            $responseData['related'] = $related;
        }


        // generate response
        return static::respond(
            isset($responseID) ? $responseID : static::getTemplateName($className::$pluralNoun)
            ,array_merge($responseData, array(
                'success' => true
                ,'data' => $results
                ,'conditions' => $conditions
                ,'total' => $resultsTotal
                ,'limit' => $options['limit']
                ,'offset' => $options['offset']
            ))
        );
    }


    public static function handleRecordRequest(ActiveRecord $Record, $action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '':
            case false:
            {
                $className = static::$recordClass;

                return static::respond(static::getTemplateName($className::$singularNoun), array(
                    'success' => true
                    ,'data' => $Record
                ));
            }

            case 'comment':
            {
                return static::handleCommentRequest($Record);
            }

            case 'edit':
            {
                return static::handleEditRequest($Record);
            }

            case 'delete':
            {
                return static::handleDeleteRequest($Record);
            }

            default:
            {
                return static::onRecordRequestNotHandled($Record, $action);
            }
        }
    }

    protected static function onRecordRequestNotHandled(ActiveRecord $Record, $action)
    {
        return static::throwNotFoundError();
    }



    public static function handleMultiSaveRequest()
    {
        if (0===strpos($_SERVER['CONTENT_TYPE'],'application/json')) {
            $_REQUEST = JSON::getRequestData();
        }

        if (empty($_REQUEST['data']) || !is_array($_REQUEST['data'])) {
            return static::throwInvalidRequestError('Save expects "data" field as array of record deltas');
        }

        $className = static::$recordClass;
        $results = array();
        $failed = array();
        $message = null;

        foreach ($_REQUEST['data'] AS $datum) {
            // get record
            if (empty($datum['ID']) || !is_numeric($datum['ID']) || $datum['ID'] <= 0) {
                $subClasses = $className::getStaticSubClasses();

                if (!empty($datum['Class']) && in_array($datum['Class'], $subClasses)) {
                    $defaultClass = $datum['Class'];
                } else {
                    $defaultClass = $className::getStaticDefaultClass();
                }

                $Record = new $defaultClass();
                static::onRecordCreated($Record, $datum);
            } else {
                if (!$Record = $className::getByID($datum['ID'])) {
                    return static::throwRecordNotFoundError($datum['ID']);
                }
            }

            // check write access
            if (!static::checkWriteAccess($Record)) {
                $failed[] = array(
                    'record' => $datum
                    ,'errors' => 'Write access denied'
                );

                if (!$message) {
                    $message = 'Write access denied';
                }
                continue;
            }

            // apply delta
            try {
                static::applyRecordDelta($Record, $datum);
            } catch (UserUnauthorizedException $e) {
                $failed[] = array(
                    'record' => $datum
                    ,'errors' => $e->getMessage()
                );

                if (!$message) {
                    $message = $e->getMessage();
                }
                continue;
            }

            // call template function
            static::onBeforeRecordValidated($Record, $datum);

            // try to save record
            try {
                // call template function
                static::onBeforeRecordSaved($Record, $datum);

                $Record->save();
                $results[] = (!$Record::fieldExists('Class') || get_class($Record) == $Record->Class) ? $Record : $Record->changeClass();

                // call template function
                static::onRecordSaved($Record, $datum);

                // fire event
                Emergence\EventBus::fireEvent('afterRecordTransaction', $className::getRootClass(), array(
                    'Record' => $Record,
                    'data' => $datum
                ));
            } catch (UserUnauthorizedException $e) {
                $failed[] = array(
                    'record' => $Record->getData()
                    ,'errors' => $e->getMessage()
                );

                if (!$message) {
                    $message = $e->getMessage();
                }
            } catch (RecordValidationException $e) {
                $failed[] = array(
                    'record' => $Record->getData()
                    ,'validationErrors' => $e->validationErrors
                );

                // store the first validation error in message
                if (!$message) {
                    $message = reset($e->validationErrors);

                    while (is_array($message)) {
                        $message = reset($message);
                    }
                }
            } catch (DuplicateKeyException $e) {
                $duplicateMessage = 'Duplicate value(s) "'.$e->getDuplicateValue().'" for key "'.$e->getDuplicateKey().'"';

                $failed[] = array(
                    'record' => $Record->getData()
                    ,'validationErrors' => array(
                        $e->getDuplicateKey() => $duplicateMessage
                    )
                );

                if (!$message) {
                    $message = $duplicateMessage;
                }
            }
        }

        return static::respond(static::getTemplateName($className::$pluralNoun).'Saved', array(
            'success' => count($results) || !count($failed)
            ,'data' => $results
            ,'failed' => $failed
            ,'message' => $message
        ));
    }


    public static function handleMultiDestroyRequest()
    {
        if (0===strpos($_SERVER['CONTENT_TYPE'],'application/json')) {
            $_REQUEST = JSON::getRequestData();
        }

        if (empty($_REQUEST['data']) || !is_array($_REQUEST['data'])) {
            return static::throwInvalidRequestError('Handler expects "data" field as array');
        }

        $className = static::$recordClass;
        $results = array();
        $failed = array();

        foreach ($_REQUEST['data'] AS $datum) {
            // get record
            if (is_numeric($datum)) {
                $recordID = $datum;
            } elseif (!empty($datum['ID']) && is_numeric($datum['ID'])) {
                $recordID = $datum['ID'];
            } else {
                $failed[] = array(
                    'record' => $datum
                    ,'errors' => 'ID missing'
                );
                continue;
            }

            if (!$Record = $className::getByID($recordID)) {
                $failed[] = array(
                    'record' => $datum
                    ,'errors' => 'ID not found'
                );
                continue;
            }

            // check write access
            if (!static::checkWriteAccess($Record)) {
                $failed[] = array(
                    'record' => $datum
                    ,'errors' => 'Write access denied'
                );
                continue;
            }

            // call template function
            static::onBeforeRecordDestroyed($Record);

            // destroy record
            try {
                if ($Record->destroy()) {
                    $results[] = $Record;
                }
            } catch (UserUnauthorizedException $e) {
                $failed[] = array(
                    'record' => $datum
                    ,'errors' => $e->getMessage()
                );
                continue;
            }
        }

        return static::respond(static::getTemplateName($className::$pluralNoun).'Destroyed', array(
            'success' => count($results) || !count($failed)
            ,'data' => $results
            ,'failed' => $failed
        ));
    }


    public static function handleCreateRequest(ActiveRecord $Record = null)
    {
        // save static class
        static::$calledClass = get_called_class();
        $className = static::$recordClass;

        if (!$Record) {
            $subClasses = $className::getStaticSubClasses();

            if (!empty($_REQUEST['Class']) && in_array($_REQUEST['Class'], $subClasses)) {
                $defaultClass = $_REQUEST['Class'];
            } else {
                $defaultClass = $className::getStaticDefaultClass();
            }

            $Record = new $defaultClass();
        }

        // call template function
        static::onRecordCreated($Record, $_REQUEST);

        return static::handleEditRequest($Record);
    }

    public static function handleEditRequest(ActiveRecord $Record)
    {
        $className = static::$recordClass;

        if (!static::checkWriteAccess($Record)) {
            return static::throwUnauthorizedError();
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            // apply delta
            static::applyRecordDelta($Record, $_REQUEST);

            // call template function
            static::onBeforeRecordValidated($Record, $_REQUEST);

            // validate
            if ($Record->validate()) {
                // call template function
                static::onBeforeRecordSaved($Record, $_REQUEST);

                // save record
                try {
                    $Record->save();
                } catch (UserUnauthorizedException $e) {
                    return static::throwUnauthorizedError($e->getMessage());
                }

                // call template function
                static::onRecordSaved($Record, $_REQUEST);

                // fire event
                Emergence\EventBus::fireEvent('afterRecordTransaction', $className::getRootClass(), array(
                    'Record' => $Record,
                    'data' => $_REQUEST
                ));

                // fire created response
                $responseID = static::getTemplateName($className::$singularNoun).'Saved';
                $responseData = static::getEditResponse($responseID, array(
                    'success' => true
                    ,'data' => $Record
                ));
                return static::respond($responseID, $responseData);
            }

            // fall through back to form if validation failed
        }

        $responseID = static::getTemplateName($className::$singularNoun).'Edit';
        $responseData = static::getEditResponse($responseID, array(
            'success' => false
            ,'data' => $Record
        ));

        return static::respond($responseID, $responseData);
    }


    public static function handleDeleteRequest(ActiveRecord $Record)
    {
        $className = static::$recordClass;

        if (!static::checkWriteAccess($Record)) {
            return static::throwUnauthorizedError();
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            // call template function
            static::onBeforeRecordDestroyed($Record);

            // destroy record
            try {
                $Record->destroy();
            } catch (UserUnauthorizedException $e) {
                return static::throwUnauthorizedError($e->getMessage());
            }

            // fire created response
            return static::respond(static::getTemplateName($className::$singularNoun).'Deleted', array(
                'success' => true
                ,'data' => $Record
            ));
        }

        return static::respond('confirm', array(
            'question' => 'Are you sure you want to delete this '.$className::$singularNoun.'?'
            ,'data' => $Record
        ));
    }


    public static function handleCommentRequest(ActiveRecord $Record)
    {
        if (!static::checkCommentAccess($Record)) {
            return static::throwUnauthorizedError();
        }

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $Comment = Emergence\Comments\Comment::create(array(
                'Context' => $Record
                ,'Message' => $_POST['Message']
            ), true);

            return static::respond('commentSaved', array(
                'success' => true
                ,'data' => $Comment
            ));
        } else {
            return static::throwInvalidRequestError();
        }
    }

    public static function handleFieldsRequest()
    {
        $className = static::$recordClass;

        return static::respond('fields', array(
            'fields' => $className::aggregateStackedConfig('fields'),
            'dynamicFields' => $className::aggregateStackedConfig('dynamicFields')
        ));
    }

    protected static function getTemplateName($noun)
    {
        return preg_replace_callback('/\s+([a-zA-Z])/', function($matches) { return strtoupper($matches[1]); }, $noun);
    }

    public static function respondJson($responseID, $responseData = array())
    {
        if (!static::checkAPIAccess($responseID, $responseData, 'json')) {
            return static::throwAPIUnauthorizedError();
        }

        return parent::respondJson($responseID, $responseData);
    }

    public static function respondCsv($responseID, $responseData = array())
    {
        if (!static::checkAPIAccess($responseID, $responseData, 'csv')) {
            return static::throwAPIUnauthorizedError();
        }

        return parent::respondCsv($responseID, $responseData);
    }

    public static function respondXml($responseID, $responseData = array())
    {
        if (!static::checkAPIAccess($responseID, $responseData, 'xml')) {
            return static::throwAPIUnauthorizedError();
        }

        return parent::respondXml($responseID, $responseData);
    }

    protected static function applyRecordDelta(ActiveRecord $Record, $data)
    {
        if (static::$editableFields) {
            $Record->setFields(array_intersect_key($data, array_flip(static::$editableFields)));
        } else {
            return $Record->setFields($data);
        }
    }

    protected static function buildBrowseConditions(array $conditions = array(), array &$filterObjects = [])
    {
        if (static::$browseConditions) {
            if (is_array(static::$browseConditions)) {
                $conditions = array_merge(static::$browseConditions, $conditions);
            } else {
                $conditions[] = static::$browseConditions;
            }
        }

        return $conditions;
    }

    // event template functions
    protected static function onRecordCreated(ActiveRecord $Record, $data)
    {
    }
    protected static function onBeforeRecordValidated(ActiveRecord $Record, $data)
    {
    }
    protected static function onBeforeRecordSaved(ActiveRecord $Record, $data)
    {
    }
    protected static function onBeforeRecordDestroyed(ActiveRecord $Record)
    {
    }
    protected static function onRecordSaved(ActiveRecord $Record, $data)
    {
    }

    protected static function getEditResponse($responseID, $responseData)
    {
        return $responseData;
    }

    // access control template functions
    public static function checkBrowseAccess()
    {
        if (static::$accountLevelBrowse) {
            $GLOBALS['Session']->requireAuthentication();
            return $GLOBALS['Session']->hasAccountLevel(static::$accountLevelBrowse);
        }

        return true;
    }

    public static function checkReadAccess(ActiveRecord $Record = null, $suppressLogin = false)
    {
        if (static::$accountLevelRead) {
            if (!$suppressLogin) {
                $GLOBALS['Session']->requireAuthentication();
            }

            return $GLOBALS['Session']->hasAccountLevel(static::$accountLevelRead);
        }

        return true;
    }

    public static function checkWriteAccess(ActiveRecord $Record = null, $suppressLogin = false)
    {
        if (static::$accountLevelWrite) {
            if (!$suppressLogin) {
                $GLOBALS['Session']->requireAuthentication();
            }

            return $GLOBALS['Session']->hasAccountLevel(static::$accountLevelWrite);
        }

        return true;
    }

    public static function checkCommentAccess(ActiveRecord $Record = null)
    {
        if (static::$accountLevelComment) {
            return $GLOBALS['Session']->hasAccountLevel(static::$accountLevelComment);
        }

        return true;
    }

    public static function checkAPIAccess($responseID, $responseData, $responseMode)
    {
        if (static::$accountLevelAPI) {
            $GLOBALS['Session']->requireAuthentication();
            return $GLOBALS['Session']->hasAccountLevel(static::$accountLevelAPI);
        }

        return true;
    }


    protected static function throwRecordNotFoundError($handle, $message = 'Record not found')
    {
        return static::throwNotFoundError($message);
    }
}
