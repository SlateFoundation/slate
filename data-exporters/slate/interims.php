<?php

use Slate\Term;
use Slate\Progress\SectionInterimReport;

return [
    'title' => 'Interim Reports',
    'description' => 'Each row represents an interim report for a given student+section+term',
    'filename' => 'interim-reports',
    'headers' => [
        'ReportID' => 'Report ID',
        'ReportDate' => 'Report Date',
        'StudentName' => 'Student Name',
        'StudentID' => 'Student ID',
        'StudentYear' => 'Student Year',
        'StudentGradeLevel' => 'Student Grade Level',
        'StudentAdvisor' => 'Student Advisor',
        'InterimSection' => 'Interim Section',
        'InterimAuthor' => 'Interim Author',
        'InterimGrade' => 'Interim Grade'
    ],
    'readQuery' => function (array $input) {
        $query = [
            'term' => null
        ];

        if (!empty($input['term'])) {
            if ($input['term'] == '*current') {
                if (!$Term = Term::getClosest()) {
                    throw new OutOfBoundsException('no current term found');
                }
            } elseif (!$Term = Term::getByHandle($input['term'])) {
                throw new OutOfBoundsException('term not found');
            }

            $query['term'] = $Term->Handle;
        }

        return $query;
    },
    'buildRows' => function (array $query = [], array $config = []) {

        // calculate closest graduation year for converting year to grade
        $closestGraduationYear = Term::getClosestGraduationYear();

        // build conditions
        $conditions = [];
        $order = [
            'ID'
        ];

        if ($query['term']) {
            $conditions['TermID'] = [
                'values' => Term::getByHandle($query['term'])->getRelatedTermIDs()
            ];
        }

        $conditions = SectionInterimReport::mapConditions($conditions);

        // build rows
        try {
            $result = DB::query(
                '
                    SELECT Report.*
                      FROM `%s` Report
                     WHERE (%s)
                     ORDER BY %s
                ',
                [
                    SectionInterimReport::$tableName,
                    count($conditions) ? join(') AND (', $conditions) : 'TRUE',
                    implode(',', $order)
                ]
            );

            while ($record = $result->fetch_assoc()) {
                $Report = SectionInterimReport::instantiateRecord($record);

                yield [
                    'ReportID' => $Report->ID,
                    'ReportDate' => date('Y-m-d H:i', $Report->Created),
                    'StudentName' => $Report->Student->LastName.', '.$Report->Student->FirstName,
                    'StudentID' => $Report->Student->StudentNumber,
                    'StudentYear' => $Report->Student->GraduationYear,
                    'StudentGradeLevel' => 12 - ($Report->Student->GraduationYear - $closestGraduationYear),
                    'StudentAdvisor' => $Report->Student->Advisor->LastName.', '.$Report->Student->Advisor->FirstName,
                    'InterimSection' => $Report->Section->Code,
                    'InterimAuthor' => $Report->Creator->LastName.', '.$Report->Creator->FirstName,
                    'InterimGrade' => $Report->Grade
                ];
            }
        } finally {
            if ($result) {
                $result->free();
            }
        }
    }
];