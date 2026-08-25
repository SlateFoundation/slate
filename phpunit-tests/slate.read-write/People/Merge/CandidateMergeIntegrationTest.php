<?php

namespace Slate\TestsRW\People\Merge;

use DB;
use Emergence\People\Person;
use Slate\People\Merge\Candidate;
use Slate\People\Merge\Merge;
use Slate\People\Merge\MergeAudit;

/**
 * Covers the plans/duplicate-candidates.md Validation checklist item:
 * "Executing a merge with candidateID transitions the pair to merged with
 * the audit link." Exercises the real Merge::execute() -> Candidate
 * integration point (Merge::linkCandidate()), not just Candidate's own
 * markMerged() unit behavior (see CandidateTest). Requires a live DB via
 * the full Emergence/Slate runtime; not runnable outside a composed site.
 */
class CandidateMergeIntegrationTest extends \PHPUnit_Framework_TestCase
{
    protected static $Source;
    protected static $Target;
    protected static $Candidate;

    protected function setUp(): void
    {
        static::$Source = Person::create(['FirstName' => 'CandidateMergeSource', 'LastName' => 'Fixture'], true);
        static::$Target = Person::create(['FirstName' => 'CandidateMergeTarget', 'LastName' => 'Fixture'], true);
        static::$Candidate = Candidate::upsertPair(static::$Source->ID, static::$Target->ID, 'identical-name', 0.4, ['firstName' => 'CandidateMerge']);
    }

    protected function tearDown(): void
    {
        $ids = array_filter([static::$Source?->ID, static::$Target?->ID]);
        if (!$ids) {
            return;
        }

        $idList = implode(',', $ids);

        DB::nonQuery('DELETE FROM `%s` WHERE Person1ID IN (%s) OR Person2ID IN (%s)', [Candidate::$tableName, $idList, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE SourcePersonID IN (%s) OR TargetPersonID IN (%s)', [MergeAudit::$tableName, $idList, $idList]);
        DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%s)', [Person::$tableName, $idList]);
    }

    public function testExecutingMergeWithCandidateIDTransitionsPairToMergedWithAuditLink()
    {
        $Audit = Merge::execute(static::$Source, static::$Target, [], static::$Candidate->ID);

        $Reloaded = Candidate::getByID(static::$Candidate->ID);
        $this->assertEquals(Candidate::STATUS_MERGED, $Reloaded->Status);
        $this->assertEquals($Audit->ID, $Reloaded->MergeAuditID);

        $lastDecision = end($Reloaded->DecisionLog);
        $this->assertEquals('merged', $lastDecision['status']);
    }

    public function testExecuteWithoutCandidateIDLeavesTheOpenPairAlone()
    {
        Merge::execute(static::$Source, static::$Target);

        $Reloaded = Candidate::getByID(static::$Candidate->ID);
        $this->assertEquals(Candidate::STATUS_OPEN, $Reloaded->Status);
        $this->assertNull($Reloaded->MergeAuditID);
    }

    public function testRepeatedExecuteStillLinksACandidateIDSuppliedOnlyTheSecondTime()
    {
        // first execute has no candidateID -- mirrors a manual merge that
        // didn't originate from the candidate queue
        $FirstAudit = Merge::execute(static::$Source, static::$Target);

        // a later request references the queued candidate against the
        // same (now already-merged) source/target pair
        $SecondAudit = Merge::execute(static::$Source, static::$Target, [], static::$Candidate->ID);

        $this->assertEquals($FirstAudit->ID, $SecondAudit->ID, 'repeated execute still returns the prior audit');

        $Reloaded = Candidate::getByID(static::$Candidate->ID);
        $this->assertEquals(Candidate::STATUS_MERGED, $Reloaded->Status);
        $this->assertEquals($FirstAudit->ID, $Reloaded->MergeAuditID);
    }

    public function testExecuteWithAnUnknownCandidateIDDoesNotFailTheMerge()
    {
        $Audit = Merge::execute(static::$Source, static::$Target, [], 999999999);

        $this->assertNotNull($Audit);
    }
}
