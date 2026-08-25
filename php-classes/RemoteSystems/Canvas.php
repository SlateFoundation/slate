<?php

declare(strict_types=1);

namespace RemoteSystems;

/**
 * Minimal Canvas LMS API client (https://canvas.instructure.com/doc/api/),
 * following the same static-config/executeRequest shape as the sibling
 * GoogleApps client. Carries only the endpoints the person-merge follow-up
 * executor needs (see Slate\Connectors\Canvas\UserMergeExecutor) -- it is
 * not a general-purpose Canvas SDK.
 *
 * Configure per-site via php-config/RemoteSystems/Canvas.config.php.
 */
class Canvas
{
    public static string $canvasHost = '';
    public static string $apiToken = '';
    public static string $accountID = '';

    /**
     * @return array<array-key, mixed> an associative array for object
     *                                 endpoints (e.g. a user), or a list for
     *                                 collection endpoints (e.g. logins)
     *
     * @throws CanvasApiException on a non-2xx response or a transport-level
     *                            failure; the HTTP status code (when one
     *                            was received) is the exception code.
     */
    public static function executeRequest(string $path, string $requestMethod = 'GET', array $params = [], array $headers = []): array
    {
        $url = 'https://'.static::$canvasHost.'/api/v1/'.$path;

        $ch = curl_init();

        if ($requestMethod === 'GET') {
            if (count($params) > 0) {
                $url .= '?'.http_build_query($params);
            }
        } else {
            if ($requestMethod === 'POST') {
                curl_setopt($ch, CURLOPT_POST, true);
            } else {
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestMethod);
            }

            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge([
            sprintf('Authorization: Bearer %s', static::$apiToken),
        ], $headers));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($ch);

        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new CanvasApiException("Canvas API request to \"$path\" failed: $error");
        }

        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = is_string($response) ? json_decode($response, true) : null;

        if ($statusCode < 200 || $statusCode >= 300) {
            $detail = is_array($decoded) && isset($decoded['errors']) ? json_encode($decoded['errors']) : $response;
            throw new CanvasApiException("Canvas API request to \"$path\" returned HTTP $statusCode: $detail", $statusCode);
        }

        return is_array($decoded) ? $decoded : [];
    }

    // Users: https://canvas.instructure.com/doc/api/users.html

    /**
     * @return array<string, mixed>
     */
    public static function getUser(string $userID): array
    {
        $user = static::executeRequest('users/'.rawurlencode($userID));

        /** @var array<string, mixed> $user */
        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    public static function getUserBySisID(string $sisUserID): array
    {
        $user = static::executeRequest('users/sis_user_id:'.rawurlencode($sisUserID));

        /** @var array<string, mixed> $user */
        return $user;
    }

    /**
     * https://canvas.instructure.com/doc/api/users.html#method.users.merge_into
     *
     * @return array<string, mixed>
     */
    public static function mergeUserInto(string $sourceUserID, string $destinationUserID): array
    {
        $result = static::executeRequest(
            'users/'.rawurlencode($sourceUserID).'/merge_into/'.rawurlencode($destinationUserID),
            'PUT'
        );

        /** @var array<string, mixed> $result */
        return $result;
    }

    // Logins: https://canvas.instructure.com/doc/api/logins.html

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function getUserLogins(string $userID): array
    {
        $logins = static::executeRequest('users/'.rawurlencode($userID).'/logins');

        /** @var array<int, array<string, mixed>> $logins */
        return $logins;
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return array<string, mixed>
     */
    public static function updateLogin(string $accountID, string $loginID, array $data): array
    {
        $result = static::executeRequest(
            'accounts/'.rawurlencode($accountID).'/logins/'.rawurlencode($loginID),
            'PUT',
            ['login' => $data]
        );

        /** @var array<string, mixed> $result */
        return $result;
    }
}
