<?php

namespace Slate\People\Merge;

use ActiveRecord;
use Exception;

/**
 * Handles /people/merge/candidates/* -- list (GET, default status=open) and
 * decision-recording (PATCH: dismiss/defer/re-open). Reached only after
 * MergeRequestHandler's admin-only check.
 *
 * There is no create/delete route here -- candidates are only ever written
 * by detectors (Candidate::upsertPair(), run via CandidateDetectionRunner
 * from POST .../detect or site-root/powertools/duplicate-detection.php)
 * and by Merge::execute() (Candidate::markMerged()); the `merged` status is
 * unreachable through this handler by design.
 *
 * @see specs/api/person-merge.md
 */
class CandidatesRequestHandler extends \Slate\RecordsRequestHandler
{
    public static $recordClass = Candidate::class;

    public static $accountLevelBrowse = 'Administrator';
    public static $accountLevelRead = 'Administrator';
    public static $accountLevelWrite = 'Administrator';
    public static $accountLevelAPI = 'Administrator';

    public static $browseOrder = ['Score' => 'DESC', 'ID' => 'DESC'];

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'detect':
                return static::handleDetectRequest();

            default:
                return parent::handleRecordsRequest($action);
        }
    }

    /**
     * POST /people/merge/candidates/detect -- run every registered detector
     * and upsert findings (idempotent, see CandidateDetectionRunner)
     */
    public static function handleDetectRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return static::throwInvalidRequestError('detect requires POST');
        }

        $summary = CandidateDetectionRunner::run();

        return static::respond('detectionRun', [
            'success' => true,
            'data' => [
                'matchesByDetector' => $summary,
                'totalMatches' => array_sum($summary),
            ],
        ]);
    }

    protected static function buildBrowseConditions(array $conditions = [], array &$filterObjects = [])
    {
        $conditions = parent::buildBrowseConditions($conditions, $filterObjects);

        $status = isset($_GET['status']) && $_GET['status'] !== '' ? $_GET['status'] : Candidate::STATUS_OPEN;

        if ($status !== 'all') {
            $conditions['Status'] = $status;
        }

        return $conditions;
    }

    public static function handleRecordRequest(ActiveRecord $Record, $action = false)
    {
        if (!$Record instanceof Candidate) {
            return static::throwServerError('Unexpected record type');
        }

        if ($action === false || $action === '') {
            $action = static::shiftPath();
        }

        switch ($action) {
            case '':
            case false:
                if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
                    return static::handlePatchCandidateRequest($Record);
                }
                return parent::handleRecordRequest($Record, $action);

            default:
                return parent::handleRecordRequest($Record, $action);
        }
    }

    public static function handlePatchCandidateRequest(Candidate $Candidate)
    {
        $requestData = \JSON::getRequestData();
        if (!is_array($requestData)) {
            $requestData = $_REQUEST;
        }

        $status = $requestData['status'] ?? null;
        $notes = $requestData['notes'] ?? null;

        if (!in_array($status, [Candidate::STATUS_OPEN, Candidate::STATUS_DISMISSED, Candidate::STATUS_DEFERRED], true)) {
            return static::throwInvalidRequestError('status must be one of: open, dismissed, deferred');
        }

        if (!is_string($notes) || trim($notes) === '') {
            return static::throwInvalidRequestError('notes is required');
        }

        try {
            $Candidate->recordDecision($status, $notes, 'operator', $GLOBALS['Session']->Person);
        } catch (Exception $e) {
            return static::throwInvalidRequestError($e->getMessage());
        }

        $Candidate->save();

        return static::respond('candidateUpdated', [
            'success' => true,
            'data' => $Candidate,
        ]);
    }
}
