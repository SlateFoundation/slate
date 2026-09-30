<?php

namespace Slate\TestsRW\Connectors;

use DB;
use SpreadsheetReader;
use Emergence\Connectors\Mapping;
use Emergence\People\Person;
use Slate\Connectors\Job;
use Slate\Courses\Course;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;
use Slate\People\Student;
use Slate\Term;

/**
 * Covers specs/behaviors/section-enrollment-import.md through
 * AbstractSpreadsheetConnector::pullEnrollments, with start and end date
 * columns mapped (DatedEnrollmentsConnector) so that a kept role can be
 * shown to still take the row's dates. The Cypress spec
 * cypress/integration/connectors/enrollment-import.js covers the same rule
 * over HTTP with stock columns.
 *
 * Requires a live DB via the full Emergence/Slate runtime (see
 * .analysis-context/skeleton-v3/vendor/emergence/php-core/handlers/phpunit.php);
 * no CI workflow runs this suite.
 */
class EnrollmentImportRolesTest extends \PHPUnit_Framework_TestCase
{
    protected static $Term;
    protected static $Course;
    protected static $Section;
    protected static $sectionIdentifier;

    protected static $Assistant;
    protected static $Plain;
    protected static $Absent;

    protected function setUp(): void
    {
        $suffix = uniqid();

        static::$Term = Term::create([
            'Title' => 'Enrollment import roles test '.$suffix,
            'Handle' => 'enrollment-import-roles-'.$suffix,
            'StartDate' => '2001-09-01',
            'EndDate' => '2002-06-30',
        ], true);

        static::$Course = Course::create([
            'Title' => 'Enrollment import roles test',
            'Code' => 'EIRT-'.$suffix,
        ], true);

        static::$Section = Section::create([
            'Course' => static::$Course,
            'Term' => static::$Term,
            'Code' => 'EIRT-'.$suffix.'-001',
        ], true);

        static::$sectionIdentifier = 'EIRT-'.$suffix;

        Mapping::create([
            'Context' => static::$Section,
            'Source' => 'creation',
            'Connector' => DatedEnrollmentsConnector::getConnectorId(),
            'ExternalKey' => DatedEnrollmentsConnector::$sectionForeignKeyName,
            'ExternalIdentifier' => static::$Term->Handle.':'.static::$sectionIdentifier,
        ], true);

        static::$Assistant = static::createStudent('Assistant', $suffix);
        static::$Plain = static::createStudent('Plain', $suffix);
        static::$Absent = static::createStudent('Absent', $suffix);

        // raised by hand to Assistant, with no dates yet
        SectionParticipant::create([
            'Section' => static::$Section,
            'Person' => static::$Assistant,
            'Role' => 'Assistant',
        ], true);

        // enrolled as a student, but missing from every sheet below
        SectionParticipant::create([
            'Section' => static::$Section,
            'Person' => static::$Absent,
            'Role' => 'Student',
        ], true);
    }

    protected function tearDown(): void
    {
        $personIds = implode(',', array_filter([static::$Assistant?->ID, static::$Plain?->ID, static::$Absent?->ID]));

        if (static::$Section) {
            DB::nonQuery('DELETE FROM `%s` WHERE CourseSectionID = %u', [SectionParticipant::$tableName, static::$Section->ID]);
            DB::nonQuery('DELETE FROM `%s` WHERE ContextClass = "%s" AND ContextID = %u', [Mapping::$tableName, DB::escape(Section::getStaticRootClass()), static::$Section->ID]);
            DB::nonQuery('DELETE FROM `%s` WHERE ID = %u', [Section::$tableName, static::$Section->ID]);
        }

        if (static::$Course) {
            DB::nonQuery('DELETE FROM `%s` WHERE ID = %u', [Course::$tableName, static::$Course->ID]);
        }

        if ($personIds) {
            DB::nonQuery('DELETE FROM `%s` WHERE ID IN (%s)', [Person::$tableName, $personIds]);
        }

        static::$Term?->destroy();
    }

    public function testKeptRoleStillTakesTheRowsDates()
    {
        [$results, $logEntries] = static::runImport([
            [static::$Assistant->StudentNumber, '2001-09-10', '2002-06-15'],
            [static::$Plain->StudentNumber, '2001-09-10', '2002-06-15'],
        ]);

        $assistant = static::getParticipantRow(static::$Assistant);
        $this->assertSame('Assistant', $assistant['Role'], 'the raised role is kept');
        $this->assertSame(date('Y-m-d H:i:s', strtotime('2001-09-10')), $assistant['StartDate'], 'the row\'s start date is applied');
        $this->assertSame(date('Y-m-d H:i:s', strtotime('2002-06-15')), $assistant['EndDate'], 'the row\'s end date is applied');

        $plain = static::getParticipantRow(static::$Plain);
        $this->assertSame('Student', $plain['Role'], 'a plain student is still imported');

        $this->assertNull(static::getParticipantRow(static::$Absent), 'an absent student is still pruned');

        $this->assertSame(1, $results['enrollments-created'] ?? 0);
        $this->assertSame(1, $results['enrollments-updated'] ?? 0, 'the kept participant\'s dates changed, so it counts as an update');
        $this->assertSame(1, $results['enrollments-role-kept'] ?? 0);
        $this->assertSame(1, $results['enrollments-removed'] ?? 0);

        $keptEntries = static::findKeptRoleEntries($logEntries);
        $this->assertCount(1, $keptEntries);
        $this->assertSame('notice', $keptEntries[0]['level']);
        $this->assertSame('Assistant', $keptEntries[0]['context']['role']);
        $this->assertSame('Student', $keptEntries[0]['context']['importedRole']);
    }

    public function testSecondImportChangesNothing()
    {
        $rows = [
            [static::$Assistant->StudentNumber, '2001-09-10', '2002-06-15'],
            [static::$Plain->StudentNumber, '2001-09-10', '2002-06-15'],
        ];

        static::runImport($rows);
        [$results] = static::runImport($rows);

        $this->assertSame(0, $results['enrollments-created'] ?? 0);
        $this->assertSame(0, $results['enrollments-updated'] ?? 0, 'a row that changed nothing is not an update');
        $this->assertSame(0, $results['enrollments-removed'] ?? 0);
        $this->assertSame(1, $results['enrollments-role-kept'] ?? 0);

        $this->assertSame('Assistant', static::getParticipantRow(static::$Assistant)['Role']);
    }

    public function testPretendReportsWhatARealRunDoes()
    {
        $rows = [
            [static::$Assistant->StudentNumber, '2001-09-10', '2002-06-15'],
            [static::$Plain->StudentNumber, '2001-09-10', '2002-06-15'],
        ];

        [$pretendResults, $pretendLog] = static::runImport($rows, true);

        // nothing was saved
        $assistant = static::getParticipantRow(static::$Assistant);
        $this->assertSame('Assistant', $assistant['Role']);
        $this->assertNull($assistant['StartDate']);
        $this->assertNull(static::getParticipantRow(static::$Plain));
        $this->assertNotNull(static::getParticipantRow(static::$Absent));

        [$realResults, $realLog] = static::runImport($rows);

        $this->assertEquals($realResults, $pretendResults);
        $this->assertEquals(static::findKeptRoleEntries($realLog), static::findKeptRoleEntries($pretendLog));
    }

    public function testSectionListingOnlyAKeptRoleIsStillPruned()
    {
        [$results] = static::runImport([
            [static::$Assistant->StudentNumber, '', ''],
        ]);

        $this->assertSame('Assistant', static::getParticipantRow(static::$Assistant)['Role']);
        $this->assertNull(static::getParticipantRow(static::$Absent), 'the sheet lists the section, so its absent students are pruned');
        $this->assertSame(1, $results['enrollments-removed'] ?? 0);
    }


    // helpers
    protected static function createStudent(string $label, string $suffix): Student
    {
        return Student::create([
            'FirstName' => 'EnrollmentImport'.$label,
            'LastName' => 'Fixture',
            'Username' => strtolower('eirt-'.$label.'-'.$suffix),
            'StudentNumber' => strtolower('eirt-'.$label.'-'.$suffix),
        ], true);
    }

    /**
     * @return array{0: array, 1: array} the job's results and log entries
     */
    protected static function runImport(array $rows, bool $pretend = false): array
    {
        $csv = fopen('php://memory', 'r+');
        fputcsv($csv, ['Student Number', 'Start Date', 'End Date', 'Section'], ',', '"', '\\');

        foreach ($rows as $row) {
            $row[] = static::$sectionIdentifier;
            fputcsv($csv, $row, ',', '"', '\\');
        }

        rewind($csv);

        $Job = Job::create([
            'Connector' => DatedEnrollmentsConnector::class,
            'Config' => [
                'masterTerm' => static::$Term->Handle,
            ],
        ]);

        $results = DatedEnrollmentsConnector::pullEnrollments(
            $Job,
            SpreadsheetReader::createFromStream($csv, 'text/csv', ['arrayValues' => true]),
            $pretend
        );

        return [$results, $Job->logEntries ?? []];
    }

    protected static function getParticipantRow(Student $Student): ?array
    {
        return DB::oneRecord(
            'SELECT Role, StartDate, EndDate FROM `%s` WHERE CourseSectionID = %u AND PersonID = %u',
            [SectionParticipant::$tableName, static::$Section->ID, $Student->ID]
        );
    }

    protected static function findKeptRoleEntries(array $logEntries): array
    {
        return array_values(array_map(
            fn (array $entry) => ['level' => $entry['level'], 'context' => $entry['context']],
            array_filter($logEntries, fn (array $entry) => str_starts_with($entry['message'], 'Kept existing role '))
        ));
    }
}
