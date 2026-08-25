<?php

declare(strict_types=1);

namespace Slate\People\Merge\Detectors;

use DB;
use Emergence\People\Person;
use Emergence\People\ContactPoint\AbstractPoint;
use Emergence\Connectors\Mapping;

/**
 * Matches a connector-mapped person who is disabled (AccountLevel =
 * "Disabled") or has zero contact points ("effectively empty") against a
 * same-name person with strictly more contact points and who isn't
 * themself disabled -- the classic re-import/re-provisioning artifact
 * where a connector keeps syncing into a stale husk record instead of the
 * real one.
 *
 * @see specs/behaviors/person-merge.md#duplicate-candidates
 */
class MappingAnomalyDetector extends AbstractDetector
{
    public const SLUG = 'mapping-anomaly';
    protected const SCORE = 0.7;

    public function getSlug(): string
    {
        return self::SLUG;
    }

    public function detect(): array
    {
        $tombstoned = $this->getTombstonedPersonIDs();
        $excludeMapped = $this->excludeIDsClause('p.ID', $tombstoned);
        $excludeRicher = $this->excludeIDsClause('r.ID', $tombstoned);

        $rows = DB::allRecords(
            'SELECT DISTINCT
                    p.ID AS MappedID, r.ID AS RicherID, p.FirstName, p.LastName,
                    p.AccountLevel AS MappedAccountLevel,
                    COALESCE(pc.Total, 0) AS MappedContactCount,
                    COALESCE(rc.Total, 0) AS RicherContactCount
               FROM `%1$s` p
               JOIN `%2$s` cm
                 ON cm.ContextClass = "%3$s"
                AND cm.ContextID = p.ID
               JOIN `%1$s` r
                 ON r.ID != p.ID
                AND LOWER(TRIM(r.FirstName)) = LOWER(TRIM(p.FirstName))
                AND LOWER(TRIM(r.LastName)) = LOWER(TRIM(p.LastName))
          LEFT JOIN (SELECT PersonID, COUNT(*) AS Total FROM `%4$s` GROUP BY PersonID) pc ON pc.PersonID = p.ID
          LEFT JOIN (SELECT PersonID, COUNT(*) AS Total FROM `%4$s` GROUP BY PersonID) rc ON rc.PersonID = r.ID
              WHERE TRIM(p.FirstName) != ""
                AND TRIM(p.LastName) != ""
                AND (p.AccountLevel = "Disabled" OR COALESCE(pc.Total, 0) = 0)
                AND (r.AccountLevel IS NULL OR r.AccountLevel != "Disabled")
                AND COALESCE(rc.Total, 0) > COALESCE(pc.Total, 0)
                AND %5$s
                AND %6$s',
            [
                Person::$tableName,
                Mapping::$tableName,
                DB::escape(Person::getRootClass()),
                AbstractPoint::$tableName,
                $excludeMapped,
                $excludeRicher,
            ]
        );

        return array_map(fn (array $row) => [
            'personAID' => (int) $row['MappedID'],
            'personBID' => (int) $row['RicherID'],
            'score' => self::SCORE,
            'evidence' => [
                'mappedPersonID' => (int) $row['MappedID'],
                'mappedPersonAccountLevel' => $row['MappedAccountLevel'],
                'mappedPersonContactPointCount' => (int) $row['MappedContactCount'],
                'richerPersonID' => (int) $row['RicherID'],
                'richerPersonContactPointCount' => (int) $row['RicherContactCount'],
                'firstName' => $row['FirstName'],
                'lastName' => $row['LastName'],
            ],
        ], $rows);
    }
}
