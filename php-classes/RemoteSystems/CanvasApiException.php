<?php

declare(strict_types=1);

namespace RemoteSystems;

use Exception;

/**
 * Thrown by Canvas::executeRequest() when the Canvas LMS API returns a
 * non-2xx response, or the underlying HTTP request itself fails. The HTTP
 * status code (when one was received) is carried as the exception code, so
 * callers can distinguish e.g. a 404 (not found) from a 5xx (real outage)
 * without parsing the message.
 */
class CanvasApiException extends Exception
{
}
