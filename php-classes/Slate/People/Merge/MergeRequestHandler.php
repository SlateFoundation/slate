<?php

namespace Slate\People\Merge;

use Emergence\People\Person;

/**
 * Handles /people/merge/* -- wired in from
 * Slate\People\PeopleRequestHandler::handleRecordsRequest() as '*merge'.
 *
 * Every route here is admin-only per specs/api/person-merge.md.
 *
 * @see specs/api/person-merge.md
 */
class MergeRequestHandler extends \RequestHandler
{
    public static $userResponseModes = [
        'application/json' => 'json',
    ];

    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Administrator');

        switch (static::shiftPath()) {
            case 'preview':
                return static::handlePreviewRequest();
            case 'actions':
                return FollowUpActionsRequestHandler::handleRequest();
            case '':
            case false:
                return static::handleExecuteRequest();
            default:
                return static::throwNotFoundError();
        }
    }

    public static function handlePreviewRequest()
    {
        if (!isset($_GET['source']) || $_GET['source'] === '' || !isset($_GET['target']) || $_GET['target'] === '') {
            return static::throwInvalidRequestError('source and target are both required');
        }

        $Source = Person::getByID($_GET['source']);
        if ($Source === null) {
            return static::throwNotFoundError('source person not found');
        }

        $Target = Person::getByID($_GET['target']);
        if ($Target === null) {
            return static::throwNotFoundError('target person not found');
        }

        if ($Source->getValue('ID') === $Target->getValue('ID')) {
            return static::throwInvalidRequestError('source and target must be different people');
        }

        $result = Merge::preview($Source, $Target);

        return static::respond('mergePreview', [
            'success' => true,
            'data' => [
                'source' => $Source,
                'target' => $Target,
                'impact' => array_values($result['impact']),
                'conflicts' => $result['conflicts'],
                'followupActions' => $result['followupActions'],
            ],
        ]);
    }

    public static function handleExecuteRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return static::throwInvalidRequestError('POST required');
        }

        $requestData = \JSON::getRequestData();
        if (!is_array($requestData)) {
            $requestData = $_POST;
        }

        if (
            !isset($requestData['sourceID']) || $requestData['sourceID'] === ''
            || !isset($requestData['targetID']) || $requestData['targetID'] === ''
        ) {
            return static::throwInvalidRequestError('sourceID and targetID are both required');
        }

        $Source = Person::getByID($requestData['sourceID']);
        if ($Source === null) {
            return static::throwNotFoundError('source person not found');
        }

        $Target = Person::getByID($requestData['targetID']);
        if ($Target === null) {
            return static::throwNotFoundError('target person not found');
        }

        if ($Source->getValue('ID') === $Target->getValue('ID')) {
            return static::throwInvalidRequestError('source and target must be different people');
        }

        $resolutions = isset($requestData['resolutions']) && is_array($requestData['resolutions']) ? $requestData['resolutions'] : [];
        $candidateID = isset($requestData['candidateID']) && $requestData['candidateID'] !== '' ? $requestData['candidateID'] : null;

        try {
            $Audit = Merge::execute($Source, $Target, $resolutions, $candidateID);
        } catch (MergeConflictException $e) {
            header('HTTP/1.0 409 Conflict');

            return static::respond('mergeConflict', [
                'success' => false,
                'message' => $e->getMessage(),
                'conflicts' => $e->conflicts,
            ]);
        }

        return static::respond('merged', [
            'success' => true,
            'data' => $Audit,
        ]);
    }
}
