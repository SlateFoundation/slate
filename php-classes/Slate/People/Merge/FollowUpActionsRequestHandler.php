<?php

namespace Slate\People\Merge;

use ActiveRecord;
use Exception;

/**
 * Handles /people/merge/actions/* -- list (GET, default status=pending),
 * execute-in-place (POST .../execute), and manual outcome (PATCH). Reached
 * only after MergeRequestHandler's admin-only check.
 *
 * @see specs/api/person-merge.md
 */
class FollowUpActionsRequestHandler extends \Slate\RecordsRequestHandler
{
    public static $recordClass = FollowUpAction::class;

    public static $accountLevelBrowse = 'Administrator';
    public static $accountLevelRead = 'Administrator';
    public static $accountLevelWrite = 'Administrator';
    public static $accountLevelAPI = 'Administrator';

    public static $browseOrder = ['ID' => 'DESC'];

    protected static function buildBrowseConditions(array $conditions = [], array &$filterObjects = [])
    {
        $conditions = parent::buildBrowseConditions($conditions, $filterObjects);

        $status = isset($_GET['status']) && $_GET['status'] !== '' ? $_GET['status'] : FollowUpAction::STATUS_PENDING;

        if ($status !== 'all') {
            $conditions['Status'] = $status;
        }

        return $conditions;
    }

    public static function handleRecordRequest(ActiveRecord $Record, $action = false)
    {
        if (!$Record instanceof FollowUpAction) {
            return static::throwServerError('Unexpected record type');
        }

        if ($action === false || $action === '') {
            $action = static::shiftPath();
        }

        switch ($action) {
            case 'execute':
                return static::handleExecuteActionRequest($Record);

            case '':
            case false:
                if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
                    return static::handlePatchActionRequest($Record);
                }
                return parent::handleRecordRequest($Record, $action);

            default:
                return parent::handleRecordRequest($Record, $action);
        }
    }

    public static function handleExecuteActionRequest(FollowUpAction $Action)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return static::throwInvalidRequestError('POST required');
        }

        $Executor = ActionExecutorRegistry::get($Action->Type);

        if (!$Executor instanceof \Slate\People\Merge\ActionExecutorInterface) {
            return static::throwNotFoundError(sprintf('No executor is registered for action type "%s"', $Action->Type));
        }

        try {
            $note = $Executor->execute($Action);
            $Action->recordOutcome(FollowUpAction::STATUS_COMPLETED, $note, 'executor:'.$Action->Connector, $GLOBALS['Session']->Person);
        } catch (Exception $e) {
            $Action->recordOutcome(FollowUpAction::STATUS_FAILED, $e->getMessage(), 'executor:'.$Action->Connector, $GLOBALS['Session']->Person);
        }

        $Action->save();

        return static::respond('followupActionExecuted', [
            'success' => true,
            'data' => $Action,
        ]);
    }

    public static function handlePatchActionRequest(FollowUpAction $Action)
    {
        $requestData = \JSON::getRequestData();
        if (!is_array($requestData)) {
            $requestData = $_REQUEST;
        }

        $status = $requestData['status'] ?? null;
        $notes = $requestData['notes'] ?? null;

        if (!in_array($status, [FollowUpAction::STATUS_PENDING, FollowUpAction::STATUS_COMPLETED, FollowUpAction::STATUS_SKIPPED], true)) {
            return static::throwInvalidRequestError('status must be one of: pending, completed, skipped');
        }

        if (!is_string($notes) || trim($notes) === '') {
            return static::throwInvalidRequestError('notes is required');
        }

        try {
            $Action->recordOutcome($status, $notes, 'operator', $GLOBALS['Session']->Person);
        } catch (Exception $e) {
            return static::throwInvalidRequestError($e->getMessage());
        }

        $Action->save();

        return static::respond('followupActionUpdated', [
            'success' => true,
            'data' => $Action,
        ]);
    }
}
