<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

/**
 * Default CanvasClientInterface implementation, used against the real
 * Canvas API.
 *
 * Slate core deliberately does NOT ship its own Canvas API wrapper class:
 * a real, separately distributed Canvas connector package already ships
 * `php-classes/RemoteSystems/Canvas.php` (configured per-site by that
 * package's own leaf php-config, setting `RemoteSystems\Canvas::$canvasHost`
 * / `::$apiToken`) in every composed site that has it installed. Shipping
 * a second file at that same path would shadow whichever layer composed
 * last -- see MergeSupport's docblock for the full story and the matching
 * fix on the Slate\Connectors\Canvas\Connector side.
 *
 * Instead, this class builds the executor's four REST calls directly with
 * curl, reading the already-configured host + token off the real
 * `\RemoteSystems\Canvas` class's public static properties, accessed
 * dynamically through a variable class name (never a literal
 * `\RemoteSystems\Canvas` type reference or `Foo::class`/`Foo::$prop`)
 * behind a class_exists() guard -- so this file has no hard dependency on
 * that class existing at all: a site with no Canvas connector installed
 * gets a clear CanvasApiException instead of a class-not-found fatal, and
 * static analysis here never needs that class to exist either.
 */
class CanvasClient implements CanvasClientInterface
{
    /**
     * The real Canvas connector package's API wrapper class, referenced
     * only as a plain string -- this class must load cleanly whether or
     * not that package is composed into the current site.
     */
    protected const REMOTE_SYSTEM_CLASS = 'RemoteSystems\Canvas';

    public function getUser(string $userID): ?array
    {
        try {
            $user = $this->request('GET', 'users/'.rawurlencode($userID));
        } catch (CanvasApiException $e) {
            return $this->nullOn404($e);
        }

        /** @var array<string, mixed> $user */
        return $user;
    }

    public function getUserBySisID(string $sisUserID): ?array
    {
        try {
            $user = $this->request('GET', 'users/sis_user_id:'.rawurlencode($sisUserID));
        } catch (CanvasApiException $e) {
            return $this->nullOn404($e);
        }

        /** @var array<string, mixed> $user */
        return $user;
    }

    public function mergeUserInto(string $sourceUserID, string $destinationUserID): array
    {
        $result = $this->request(
            'PUT',
            'users/'.rawurlencode($sourceUserID).'/merge_into/'.rawurlencode($destinationUserID)
        );

        /** @var array<string, mixed> $result */
        return $result;
    }

    public function getUserLogins(string $userID): array
    {
        $logins = $this->request('GET', 'users/'.rawurlencode($userID).'/logins');

        /** @var array<int, array<string, mixed>> $logins */
        return $logins;
    }

    public function updateLogin(string $accountID, string $loginID, array $data): array
    {
        $result = $this->request(
            'PUT',
            'accounts/'.rawurlencode($accountID).'/logins/'.rawurlencode($loginID),
            ['login' => $data]
        );

        /** @var array<string, mixed> $result */
        return $result;
    }

    /**
     * @return array<string, mixed>|null null when Canvas returns 404;
     *                                    re-throws every other status
     */
    protected function nullOn404(CanvasApiException $e): ?array
    {
        if ($e->getCode() === 404) {
            return null;
        }

        throw $e;
    }

    /**
     * @param array<string, mixed> $params
     *
     * @return array<array-key, mixed> an associative array for object
     *                                 endpoints (e.g. a user), or a list for
     *                                 collection endpoints (e.g. logins)
     *
     * @throws CanvasApiException on a non-2xx response, a transport-level
     *                            failure, or when the real Canvas remote
     *                            system isn't available on this site
     */
    protected function request(string $method, string $path, array $params = []): array
    {
        [$host, $token] = $this->requireConfig();

        $url = 'https://'.$host.'/api/v1/'.$path;

        $ch = curl_init();

        if ($method === 'GET') {
            if (count($params) > 0) {
                $url .= '?'.http_build_query($params);
            }
        } else {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
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

    /**
     * @return array{0: string, 1: string} [canvasHost, apiToken]
     *
     * @throws CanvasApiException when the real Canvas connector package
     *                            (RemoteSystems\Canvas) isn't composed
     *                            into this site at all
     */
    protected function requireConfig(): array
    {
        $remoteSystemClass = self::REMOTE_SYSTEM_CLASS;

        if (!class_exists($remoteSystemClass)) {
            throw new CanvasApiException('Canvas remote system is not available on this site -- the Canvas connector package is not installed/composed here');
        }

        return [
            (string) $remoteSystemClass::$canvasHost,
            (string) $remoteSystemClass::$apiToken,
        ];
    }
}
