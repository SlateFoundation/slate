<?php

namespace RemoteSystems;

class Canvas
{
    public static $canvasHost;
    public static $apiToken;
    public static $accountID;

    public static function executeRequest($path, $requestMethod = 'GET', $params = [], $headers = [])
    {
        $url = 'https://'.static::$canvasHost.'/api/v1/'.$path;

        // confugre cURL
        $ch = curl_init();

        if ($requestMethod == 'GET') {
            $url .= '?'.(is_string($params) ? $params : http_build_query($params));
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

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge([
            sprintf('Authorization: Bearer %s', static::$apiToken)
        ], $headers));

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = json_decode(curl_exec($ch), true);
        curl_close($ch);

        return $response;
    }


    // Accounts: https://canvas.instructure.com/doc/api/accounts.html
    public static function getAccount($accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID");
    }


    // Users: https://canvas.instructure.com/doc/api/users.html
    public static function getUser($userID)
    {
        return static::executeRequest("users/$userID/profile");
    }

    public static function createUser($data, $accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID/users", 'POST', $data);
    }

    public static function updateUser($userID, $data)
    {
        return static::executeRequest("users/$userID", 'PUT', $data);
    }


    // Logins: https://canvas.instructure.com/doc/api/logins.html
    public static function getLoginsByUser($userID)
    {
        return static::executeRequest("users/$userID/logins");
    }

    public static function updateLogin($loginID, $data, $accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID/logins/$loginID", 'PUT', $data);
    }


    // Courses: https://canvas.instructure.com/doc/api/courses.html
    public static function getCourse($courseID)
    {
        return static::executeRequest("courses/$courseID");
    }

    public static function createCourse($data, $accountID = null)
    {
        if (!$accountID) {
            $accountID = static::$accountID;
        }

        return static::executeRequest("accounts/$accountID/courses", 'POST', $data);
    }

    public static function updateCourse($courseID, $data)
    {
        return static::executeRequest("courses/$courseID", 'PUT', $data);
    }

    public static function deleteCourse($courseID, $event = 'conclude')
    {
        return static::executeRequest("courses/$courseID", 'DELETE', [
            'event' => $event
        ]);
    }


    // Sections: https://canvas.instructure.com/doc/api/sections.html
    public static function getSection($sectionID)
    {
        return static::executeRequest("sections/$sectionID");
    }

    public static function getSectionsByCourse($courseID)
    {
        return static::executeRequest("courses/$courseID/sections", 'GET', ['per_page' => 1000]);
    }

    public static function createSection($courseID, $data)
    {
        return static::executeRequest("courses/$courseID/sections", 'POST', $data);
    }

    public static function updateSection($sectionID, $data)
    {
        return static::executeRequest("sections/$sectionID", 'PUT', $data);
    }

    public static function deleteSection($sectionID)
    {
        return static::executeRequest("sections/$sectionID", 'DELETE');
    }


    // Enrollments: https://canvas.instructure.com/doc/api/enrollments.html
    public static function getEnrollmentsBySection($sectionID)
    {
        return static::executeRequest("sections/$sectionID/enrollments", 'GET', ['per_page' => 1000]);
    }

    public static function createEnrollmentsForSection($sectionID, $data)
    {
        return static::executeRequest("sections/$sectionID/enrollments", 'POST', $data);
    }

    public static function deleteEnrollmentsForCourse($courseID, $enrollmentID, $task = 'conclude')
    {
        return static::executeRequest("courses/$courseID/enrollments/$enrollmentID", 'DELETE', [
            'task' => $task
        ]);
    }
}