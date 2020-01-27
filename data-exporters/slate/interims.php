<?php

use Slate\Term;
use Slate\TermsRequestHandler;
use Slate\Progress\SectionInterimReport;


return [
    'title' => 'Interim Reports',
    'description' => 'Each row represents an interim report for a given student+section+term',
    'filename' => 'interim-reports',
    'headers' => [
        'ReportID' => 'Report ID',
        'ReportCreated' => 'Report Date',
        'StudentFullName' => 'Student Name',
        'StudentNumber' => 'Student ID',
        'StudentGraduationYear' => 'Student Year',
        'StudentGradeLevel' => 'Student Grade Level',
        'AdvisorFullName' => 'Student Advisor',
        'SectionCode' => 'Interim Section',
        'AuthorFullName' => 'Interim Author',
        'ReportGrade' => 'Interim Grade'
    ],
    'readQuery' => function (array $input) {
        $query = [
            'term' => '*'
        ];

        if (empty($input['term']) || $input['term'] == '*current') {
            if (!$Term = Term::getClosest()) {
                throw new OutOfBoundsException('no current term could be found');
            }

            $query['term'] = $Term->Handle;
        } else {
            if (!$Term = TermsRequestHandler::getRecordByHandle($input['term'])) {
                throw new OutOfBoundsException('term not found');
            }

            $query['term'] = $Term->Handle;
        }

        return $query;
    },
    'buildRows' => function (array $query = [], array $config = []) {

        // build SectionInterimReport conditions
        $conditions = [];
        $order = ['ID'];

        if ($query['term']) {
            if (!$Term = TermsRequestHandler::getRecordByHandle($query['term'])) {
                throw new Exception('term not found');
            }

            $conditions['TermID'] = $Term->ID;
        }

        $conditions = SectionInterimReport::mapConditions($conditions);


        // calculate closest graduation year for converting year to grade
        $closestGraduationYear = Term::getClosestGraduationYear();


        // build rows
        $result = DB::query(
            '
                SELECT SectionInterimReport.*
                  FROM `%s` SectionInterimReport
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
                'ReportCreated' => date('Y-m-d H:i', $Report->Created),
                'StudentFullName' => $Report->Student->LastName.', '.$Report->Student->FirstName,
                'StudentNumber' => $Report->Student->StudentNumber,
                'StudentGraduationYear' => $Report->Student->GraduationYear,
                'StudentGradeLevel' => 12 - ($Report->Student->GraduationYear - $closestGraduationYear),
                'AdvisorFullName' => $Report->Student->Advisor ? $Report->Student->Advisor->LastName.', '.$Report->Student->Advisor->FirstName : null,
                'SectionCode' => $Report->Section->Code,
                'AuthorFullName' => $Report->Creator->LastName.', '.$Report->Creator->FirstName,
                'ReportGrade' => $Report->Grade
            ];
        }
    }
];