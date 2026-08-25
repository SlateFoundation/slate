<?php

declare(strict_types=1);

namespace Slate\Connectors\Canvas;

use Exception;

/**
 * Thrown by CanvasClient when the Canvas LMS API returns a non-2xx
 * response, the underlying HTTP request fails, or the real
 * `\RemoteSystems\Canvas` remote system isn't available on this site at
 * all (see CanvasClient's docblock for why this executor doesn't ship its
 * own API wrapper class). The HTTP status code (when one was received) is
 * carried as the exception code, so callers can distinguish e.g. a 404
 * (not found) from a 5xx (real outage) without parsing the message.
 *
 * Lives in this namespace, not RemoteSystems\*, deliberately: a composed
 * Slate site carries a full, separately-distributed Canvas connector
 * package under RemoteSystems\Canvas -- this executor must never ship a
 * same-path file that could shadow it (see MergeSupport's docblock).
 */
class CanvasApiException extends Exception
{
}
