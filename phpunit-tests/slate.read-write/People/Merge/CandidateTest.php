<?php

namespace Slate\TestsRW\People\Merge;

use DB;
use Emergence\People\Person;
use Exception;
use Slate\People\Merge\Candidate;
use Slate\People\Merge\MergeAudit;

/**
 * Unit-level coverage of Candidate: the upsert idempotency rules detectors
 * rely on (Candidate::upsertPair()) and the decision lifecycle the PATCH
 * endpoint relies on (Candidate::recordDecision()/markMerged()). Requires a
 * live DB via the full Emergence/Slate runtime; not runnable outside a
 * composed site.
 *
 * Covers the Validation checklist in plans/duplicate-candidates.md:
 *   - re-running detection does not resurrect a dismissed pair or
 *     duplicate an open one (testUpsertPair*)
 *   - executing a merge with candidateID transitions the pair to merged
 *     with the audit link (testMarkMerged*)
 *   - PATCH enforces the lifecycle: no leaving merged, notes required
 *     (testRecordDecision*)
 */
class CandidateTest extends \PHPUnit_Framework_TestCase
{
    protected static $PersonA;
    protected static $PersonB;

    protected function setUp(): void
    {
        static::$PersonA = Person::create(['FirstName' => 'CandidateTestA', 'LastName' => 'Fixture'], true);
        static::$PersonB = Person::create(['FirstName' => 'CandidateTestB', 'LastName' => 'Fixture'], true);
    }

    protected function tearDown(): void
    {
        DB::nonQuery('DELETE FROM `%s` WHERE Person1ID IN (%u, %u) OR Person2ID IN (%u, %u)', [
            Candidate::$tableName,
            static::$PersonA->ID, static::$PersonB->ID,
            static::$PersonA->ID, static::$PersonB->ID,
        ]);
        DB::nonQuery('DELETE FROM `%s` WHERE SourcePersonID IN (%u, %u) OR TargetPersonID IN (%u, %u)', [
            MergeAudit::$tableName,
            static::$PersonA->ID, static::$PersonB->ID,
            static::$PersonA->ID, static::$PersonB->ID,
        ]);
        DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%u, %u)', [Person::$tableName, static::$PersonA->ID, static::$PersonB->ID]);
    }

    public function testUpsertPairCreatesOpenCandidateOnFirstMatch()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, ['firstName' => 'Test']);

        $this->assertEquals(Candidate::STATUS_OPEN, $Candidate->Status);
        $this->assertEquals(min(static::$PersonA->ID, static::$PersonB->ID), $Candidate->Person1ID);
        $this->assertEquals(max(static::$PersonA->ID, static::$PersonB->ID), $Candidate->Person2ID);
        $this->assertEquals('identical-name', $Candidate->Detector);
        $this->assertEquals(0.4, $Candidate->Score);
    }

    public function testUpsertPairOrdersThePairRegardlessOfArgumentOrder()
    {
        $Forward = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);
        $Backward = Candidate::upsertPair(static::$PersonB->ID, static::$PersonA->ID, 'shared-contact-point', 0.8, []);

        $this->assertEquals($Forward->ID, $Backward->ID, 'the same underlying pair is upserted regardless of argument order');
        $this->assertEquals(1, (int) DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE Person1ID IN (%u, %u)', [Candidate::$tableName, static::$PersonA->ID, static::$PersonB->ID]));
    }

    public function testUpsertPairRescoresAnOpenPairInstadOfDuplicating()
    {
        Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, ['round' => 1]);
        $Rescored = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'shared-contact-point', 0.8, ['round' => 2]);

        $this->assertEquals('shared-contact-point', $Rescored->Detector);
        $this->assertEquals(0.8, $Rescored->Score);
        $this->assertEquals(['round' => 2], $Rescored->Evidence);
        $this->assertEquals(1, (int) DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE Person1ID IN (%u, %u)', [Candidate::$tableName, static::$PersonA->ID, static::$PersonB->ID]));
    }

    public function testUpsertPairNeverResurrectsADismissedPair()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);
        $Candidate->recordDecision(Candidate::STATUS_DISMISSED, 'two different people');
        $Candidate->save();

        $Rerun = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.9, ['round' => 2]);

        $this->assertEquals(Candidate::STATUS_DISMISSED, $Rerun->Status);
        $this->assertEquals(0.4, $Rerun->Score, 'a dismissed pair is left completely untouched by a re-run');
        $this->assertEquals(1, (int) DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE Person1ID IN (%u, %u)', [Candidate::$tableName, static::$PersonA->ID, static::$PersonB->ID]));
    }

    public function testUpsertPairNeverResurrectsADeferredPair()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);
        $Candidate->recordDecision(Candidate::STATUS_DEFERRED, 'need registrar input');
        $Candidate->save();

        Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.9, []);

        $Reloaded = Candidate::getByID($Candidate->ID);
        $this->assertEquals(Candidate::STATUS_DEFERRED, $Reloaded->Status);
        $this->assertEquals(0.4, $Reloaded->Score);
    }

    public function testUpsertPairLeavesAMergedPairUntouched()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);

        $Audit = MergeAudit::create(['SourcePersonID' => static::$PersonA->ID, 'TargetPersonID' => static::$PersonB->ID], true);
        $Candidate->markMerged($Audit);
        $Candidate->save();

        Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.9, []);

        $Reloaded = Candidate::getByID($Candidate->ID);
        $this->assertEquals(Candidate::STATUS_MERGED, $Reloaded->Status);
        $this->assertEquals(0.4, $Reloaded->Score);
    }

    public function testUpsertPairRejectsASelfPair()
    {
        $this->expectException(Exception::class);
        Candidate::upsertPair(static::$PersonA->ID, static::$PersonA->ID, 'identical-name', 0.4, []);
    }

    public function testRecordDecisionRequiresNotes()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);

        $this->expectException(Exception::class);
        $Candidate->recordDecision(Candidate::STATUS_DISMISSED, '');
    }

    public function testRecordDecisionDismissThenReopenRoundTrip()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);

        $Candidate->recordDecision(Candidate::STATUS_DISMISSED, 'two different people');
        $Candidate->save();
        $this->assertEquals(Candidate::STATUS_DISMISSED, $Candidate->Status);

        $Candidate->recordDecision(Candidate::STATUS_OPEN, 'actually, re-examine this one');
        $Candidate->save();

        $this->assertEquals(Candidate::STATUS_OPEN, $Candidate->Status);
        $this->assertCount(2, $Candidate->DecisionLog);
        $this->assertEquals('two different people', $Candidate->DecisionLog[0]['notes']);
        $this->assertEquals('actually, re-examine this one', $Candidate->DecisionLog[1]['notes']);
    }

    public function testRecordDecisionRejectsMergedAsATargetStatus()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);

        $this->expectException(Exception::class);
        $Candidate->recordDecision(Candidate::STATUS_MERGED, 'trying to sneak past markMerged');
    }

    public function testRecordDecisionCannotLeaveMerged()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);
        $Audit = MergeAudit::create(['SourcePersonID' => static::$PersonA->ID, 'TargetPersonID' => static::$PersonB->ID], true);
        $Candidate->markMerged($Audit);
        $Candidate->save();

        $this->expectException(Exception::class);
        $Candidate->recordDecision(Candidate::STATUS_OPEN, 'trying to reopen a merged pair');
    }

    public function testRecordDecisionRejectsARedundantTransition()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);

        $this->expectException(Exception::class);
        $Candidate->recordDecision(Candidate::STATUS_OPEN, 'already open');
    }

    public function testMarkMergedSetsStatusAndAuditLink()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);
        $Audit = MergeAudit::create(['SourcePersonID' => static::$PersonA->ID, 'TargetPersonID' => static::$PersonB->ID], true);

        $Candidate->markMerged($Audit);
        $Candidate->save();

        $Reloaded = Candidate::getByID($Candidate->ID);
        $this->assertEquals(Candidate::STATUS_MERGED, $Reloaded->Status);
        $this->assertEquals($Audit->ID, $Reloaded->MergeAuditID);
    }

    public function testMarkMergedIsIdempotentForTheSameAudit()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);
        $Audit = MergeAudit::create(['SourcePersonID' => static::$PersonA->ID, 'TargetPersonID' => static::$PersonB->ID], true);

        $Candidate->markMerged($Audit);
        $Candidate->save();
        $logCountAfterFirst = count($Candidate->DecisionLog);

        // repeat call, same audit -- should not throw or add a second log entry
        $Candidate->markMerged($Audit);

        $this->assertEquals(Candidate::STATUS_MERGED, $Candidate->Status);
        $this->assertCount($logCountAfterFirst, $Candidate->DecisionLog);
    }

    public function testMarkMergedRejectsRelinkingToADifferentAudit()
    {
        $Candidate = Candidate::upsertPair(static::$PersonA->ID, static::$PersonB->ID, 'identical-name', 0.4, []);
        $FirstAudit = MergeAudit::create(['SourcePersonID' => static::$PersonA->ID, 'TargetPersonID' => static::$PersonB->ID], true);
        $Candidate->markMerged($FirstAudit);
        $Candidate->save();

        $OtherPerson = Person::create(['FirstName' => 'CandidateTestOther', 'LastName' => 'Fixture'], true);
        try {
            $SecondAudit = MergeAudit::create(['SourcePersonID' => $OtherPerson->ID, 'TargetPersonID' => static::$PersonB->ID], true);

            $this->expectException(Exception::class);
            $Candidate->markMerged($SecondAudit);
        } finally {
            DB::nonQuery('DELETE FROM `%s` WHERE SourcePersonID = %u', [MergeAudit::$tableName, $OtherPerson->ID]);
            DB::nonQuery('DELETE FROM `%s` WHERE ID = %u', [Person::$tableName, $OtherPerson->ID]);
        }
    }
}
