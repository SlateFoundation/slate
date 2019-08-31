<?php

abstract class CRUDRequestHandler extends RequestHandler
{
    public static $recordClass;

    public static function handleRequest()
    {
        if (empty(static::$recordClass)) {
            throw new Exception('static public $recordClass must be set to an ActiveRecord implementation');
        }


        if (static::peekPath() == 'json') {
            static::$responseMode = static::shiftPath();
        }


        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                return static::handleReadRequest();
            case 'POST':
                return static::handleCreateRequest();
            case 'PUT':
                return static::handleUpdateRequest();
            case 'DELETE':
                return static::handleDeleteRequest();
        }
    }

    public static function handleReadRequest()
    {
        if (!$resourceHandle = static::shiftPath()) {
            return static::respondCRUD(static::getAllRecords(), 'plural');
        }

        if ($Record = static::getRecord($resourceHandle)) {
            return static::respondCRUD($Record);
        } else {
            return static::throwNotFoundError('Record not found');
        }
    }

    public static function handleCreateRequest($data = null)
    {
        if ($data == null) {
            $data = static::getRequestData();
        }

        if (!$data) {
            return static::throwError('Unable to parse JSON request');
        }

        $Record = static::createRecord($data);

        if ($Record->validate()) {
            $Record->save();
            return static::respondCRUD($Record, 'singular', 'created');
        } else {
            return static::throwRecordInvalidError($Record, $data);
        }
    }

    protected static function createRecord($data)
    {
        $class = static::$recordClass;
        $Record = new $class();
        static::updateRecord($Record, $data);
        return $Record;
    }

    public static function handleUpdateRequest($data = null)
    {
        if ($data == null) {
            $data = static::getRequestData();
        }

        if (!$data) {
            return static::throwError('Unable to parse request data');
        }

        if (!$resourceHandle = static::shiftPath()) {
            return static::throwError('Unique identifier ID or Handle required for PUT operation');
        } elseif (!$Record = static::getRecord($resourceHandle)) {
            return static::throwNotFoundError('Record not found');
        }

        static::updateRecord($Record, $data);

        if ($Record->validate()) {
            $Record->save();
            return static::respondCRUD($Record, 'singular', 'updated');
        } else {
            return static::throwRecordInvalidError($Record, $data);
        }
    }

    protected static function updateRecord(ActiveRecord $Record, $data)
    {
        $Record->setFields($data);
    }

    public static function handleDeleteRequest()
    {
        if (!$resourceHandle = static::shiftPath()) {
            return static::throwError('Unique identifier ID or Handle required for PUT operation');
        } elseif (!$Record = static::getRecord($resourceHandle)) {
            return static::throwNotFoundError('Record not found');
        }

        $Record->destroy();

        return static::respondCRUD($Record, 'singular', 'deleted');
    }


    public static function getAllRecords($conditions = array(), $options = array())
    {
        $class = static::$recordClass;

        $queryOptions = array_merge(array(
            'limit' => false
        ), $options);

        // process sorter
        if (!empty($_REQUEST['sort'])) {
            $sort = json_decode($_REQUEST['sort'],true);
            if (!$sort || !is_array($sort)) {
                throw new Exception('Invalid sorter');
            }

            foreach ($sort as $field) {
                $queryOptions['order'][$field['property']] = $field['direction'];
            }
        }


        // process filter
        if (!empty($_REQUEST['filter'])) {
            $filter = json_decode($_REQUEST['filter'], true);
            if (!$filter || !is_array($filter)) {
                throw new Exception('Invalid filter');
            }

            foreach ($filter AS $field) {
                if ($_GET['anyMatch']) {
                    $conditions[$field['property']] = array(
                        'value'    =>    '%'.$field['value'].'%'
                        ,'operator' => 'LIKE'
                    );
                } else {
                    $conditions[$field['property']] = $field['value'];
                }
            }
        }

        // process limit
        if (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) {
            $queryOptions['limit'] = $_REQUEST['limit'];
        }

        // process page
        if (!empty($_REQUEST['page']) && is_numeric($_REQUEST['page']) && $queryOptions['limit']) {
            $queryOptions['offset'] = ($_REQUEST['page']-1) * $queryOptions['limit'];
        }

        return $class::getAllByWhere($conditions, $queryOptions);
    }

    public static function getRecord($resourceHandle)
    {
        $class = static::$recordClass;

        if (is_int($resourceHandle) || ctype_digit($resourceHandle)) {
            $Record = $class::getByID($resourceHandle);
        } else {
            $Record = $class::getByHandle($resourceHandle);
        }

        return $Record;
    }

    public static function respondCRUD($payload, $count = 'singular', $verb = '', $additional = array(), $responseID = false)
    {
        // auto-generate response ID from noun and verb
        if (!$responseID) {
            $responseID = static::getResponseID($count, $verb);
        }

        return static::respond($responseID, array_merge(array(
            'success' => true
            ,'data' => $payload
            ,'total' => DB::foundRows()
        )), $additional);
    }


    public static function throwRecordInvalidError(ActiveRecord $Record, $data = null)
    {
        return static::respond(static::getResponseID('singular','invalid'), array(
            'success' => false
            ,'data' => $Record
            ,'errors' => $Record->validationErrors
        ));
    }


    public static function getResponseID($count = 'singular', $verb = '')
    {
        $class = static::$recordClass;
        $noun = $count == 'singular' ? $class::$singularNoun : $class::$pluralNoun;
        return preg_replace_callback('/\s+([a-zA-Z])/', function($matches) { return strtoupper($matches[1]); }, $noun).ucfirst($verb);
    }


    public static function getRequestData()
    {
        if (0===strpos($_SERVER['CONTENT_TYPE'],'application/x-www-form-urlencoded')) {
            if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                return $_POST;
            } else {
                $data = array();
                parse_str(file_get_contents('php://input'), $data);
                return $data;
            }
        } elseif (0===strpos($_SERVER['CONTENT_TYPE'],'application/json')) {
            return JSON::getRequestData();
        } else {
            throw new Exception('Incoming content type must be application/json or application/x-www-form-urlencoded');
        }
    }
}