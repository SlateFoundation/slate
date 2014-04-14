<?php

namespace RemoteSystems;

class Canvas
{
    static public $canvasHost;
    static public $apiToken;
    static public $accountID;

    static public function executeRequest($path, $requestMethod = 'GET', $params = array(), $headers = array())
    {
        $url = 'https://'.static::$canvasHost . '/api/v1/' . $path;

        // confugre cURL
        $ch = curl_init();

        if ($requestMethod == 'GET') {
            $url .= '?' . (is_string($params) ? $params : http_build_query($params));
        } else {
            if ($requestMethod == 'POST') {
                curl_setopt($ch, CURLOPT_POST, true);
            } else {
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestMethod);
            }

            curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        }

        if (!empty($headers)) {
            $requestHeaders = array_merge($requestHeaders, $headers);
        }

#       MICS::dump($params, $url, true);

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(array(
            sprintf('Authorization: Bearer %s', static::$apiToken)
        ), $headers));

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = json_decode(curl_exec($ch), true);
#       MICS::dump(curl_getinfo($ch, CURLINFO_HTTP_CODE), 'code', true);
        curl_close($ch);

        return $response;
    }


    // Accounts: https://canvas.instructure.com/doc/api/accounts.html
    static public function getAccount($accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID");
    }


    // Users: https://canvas.instructure.com/doc/api/users.html
    static public function getUser($userID)
    {
        return static::executeRequest("users/$userID/profile");
    }

    static public function createUser($data, $accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID/users", 'POST', $data);
    }

    static public function updateUser($userID, $data)
    {
        return static::executeRequest("users/$userID", 'PUT', $data);
    }


    // Logins: https://canvas.instructure.com/doc/api/logins.html
    static public function getLoginsByUser($userID)
    {
        return static::executeRequest("users/$userID/logins");
    }

    static public function updateLogin($loginID, $data, $accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID/logins/$loginID", 'PUT', $data);
    }


    // Courses: https://canvas.instructure.com/doc/api/courses.html
    static public function getCourse($courseID)
    {
        return static::executeRequest("courses/$courseID");
    }

    static public function createCourse($data, $accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID/courses", 'POST', $data);
    }

    static public function updateCourse($courseID, $data)
    {
        return static::executeRequest("courses/$courseID", 'PUT', $data);
    }


    // Sections: https://canvas.instructure.com/doc/api/sections.html
    static public function getSection($sectionID)
    {
        return static::executeRequest("sections/$sectionID");
    }

    static public function getSectionsByCourse($courseID)
    {
        return static::executeRequest("courses/$courseID/sections", 'GET', array('per_page' => 1000));
    }

    static public function createSection($courseID, $data)
    {
        return static::executeRequest("courses/$courseID/sections", 'POST', $data);
    }

    static public function updateSection($sectionID, $data)
    {
        return static::executeRequest("sections/$sectionID", 'PUT', $data);
    }


    // Enrollments: https://canvas.instructure.com/doc/api/enrollments.html
    static public function getEnrollmentsBySection($sectionID)
    {
        return static::executeRequest("sections/$sectionID/enrollments", 'GET', array('per_page' => 1000));
    }

    static public function createEnrollmentsForSection($sectionID, $data)
    {
        return static::executeRequest("sections/$sectionID/enrollments", 'POST', $data);
    }

    static public function deleteEnrollmentsForCourse($courseID, $enrollmentID, $task = 'conclude')
    {
        return static::executeRequest("courses/$courseID/enrollments/$enrollmentID", 'DELETE', array(
            'task' => $task
        ));
    }
}