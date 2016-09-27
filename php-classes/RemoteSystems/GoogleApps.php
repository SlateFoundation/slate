<?php

namespace RemoteSystems;

class GoogleApps
{
    public static $apiToken;
    public static $domain;

    public static function executeRequest($path, $requestMethod = 'GET', $params = [], $headers = [])
    {
        $url = 'https://www.googleapis.com'.$path;

        $params['domain'] = static::$domain;

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

            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        }

        if (!empty($headers)) {
            $requestHeaders = array_merge($requestHeaders, $headers);
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge([
            sprintf('Authorization: Bearer %s', static::$apiToken)
            ,'Content-Type: application/json'
        ], $headers));

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($ch);
        $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        switch ($responseCode) {
            case 200:
                return json_decode($response, true);
            default:
                throw new \Exception("Got HTTP status $responseCode from Google API: $response", $responseCode);
        }
    }

    public static function getAllResults($path, $resultsKey, $params = [])
    {
        if (!isset($params['maxResults'])) {
            $params['maxResults'] = 500;
        }

        if (isset($params['fields'])) {
            $params['fields'] .= ',nextPageToken';
        } else {
            $params['fields'] = 'nextPageToken';
        }

        $page = static::executeRequest($path, 'GET', $params);
        $results = $page[$resultsKey];

        while (!empty($page['nextPageToken'])) {
            $page = static::executeRequest($path, 'GET', array_merge($params, [
                'pageToken' => $page['nextPageToken']
            ]));

            $results = array_merge($results, $page[$resultsKey]);
        }

        return $results;
    }

    public static function getAllUsers($params = [])
    {
        return static::getAllResults('/admin/directory/v1/users', 'users', $params);
    }

    // Patch user: https://developers.google.com/admin-sdk/directory/v1/reference/users/patch
    public static function patchUser($userKey, $data)
    {
        return static::executeRequest("/admin/directory/v1/users/$userKey", 'PATCH', $data);
    }

    // Create user: https://developers.google.com/admin-sdk/directory/v1/reference/users/insert
    public static function createUser($data)
    {
        return static::executeRequest("/admin/directory/v1/users", 'POST', $data);
    }
}