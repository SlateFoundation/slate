<?php

use Slate\People\Student;

return [
    'title' => 'Student Logins',
    'description' => 'Each row represents a student organized by advisor and includes all the details needed to get them logged into Slate',
    'filename' => 'student-logins',
    'headers' => [
        'GraduationYear' => 'Year',
        'AdvisorFullName' => 'Advisor',
        'LastName' => 'Last Name',
        'FirstName' => 'First Name',
        'StudentNumber' => 'Student Number',
        'Username',
        'Email',
        'TemporaryPassword' => 'Temporary Password'
    ],
    'readQuery' => function (array $input) {
        $query = [];

        if (!empty($input['from']) && ctype_digit($input['from'])) {
            $query['from'] = $input['from'];
        } else {
            $query['from'] = (int)date('Y', strtotime(Slate\Term::getClosest()->getMaster()->EndDate));
        }

        if (!empty($input['to']) && ctype_digit($input['to'])) {
            $query['to'] = $input['to'];
        } else {
            $query['to'] = $query['from']+3;
        }

        return $query;
    },
    'buildRows' => function (array $query = [], array $config = []) {

        // build list of advisors
        $advisors = Student::getDistinctAdvisors();

        // convert advisors to IDs
        $advisorIds = array_map(function($Advisor) {
            return $Advisor->ID;
        }, $advisors);

        // build conditions
        $conditions = [
            'Class' => Student::class
        ];
        $order = [
            'GraduationYear'
        ];

        if (count($advisorIds)) {
            $order[] = 'FIELD(AdvisorID, '.implode(',', $advisorIds).')';
        }

        if ($query['from'] && $query['to']) {
            $conditions['GraduationYear'] = [
                'operator' => 'BETWEEN',
                'min' => $query['from'],
                'max' => $query['to']
            ];
        } elseif ($query['from']) {
            $conditions['GraduationYear'] = [
                'operator' => '>=',
                'value' => $query['from']
            ];
        } elseif ($query['to']) {
            $conditions['GraduationYear'] = [
                'operator' => '<=',
                'value' => $query['to']
            ];
        }

        $order[] = 'LastName';
        $order[] = 'FirstName';

        $conditions = Student::mapConditions($conditions);

        // build rows
        try {
            $result = DB::query(
                '
                    SELECT Student.*
                      FROM `%s` Student
                     WHERE (%s)
                     ORDER BY %s
                ',
                [
                    Student::$tableName,
                    count($conditions) ? join(') AND (', $conditions) : 'TRUE',
                    implode(',', $order)
                ]
            );

            while ($record = $result->fetch_assoc()) {
                $Student = Student::instantiateRecord($record);

                yield [
                    'GraduationYear' => $Student->GraduationYear,
                    'AdvisorFullName' => $Student->Advisor ? $Student->Advisor->LastName.', '.$Student->Advisor->FirstName : null,
                    'LastName' => $Student->LastName,
                    'FirstName' => $Student->FirstName,
                    'StudentNumber' => $Student->StudentNumber,
                    'Username' => $Student->Username,
                    'Email' => $Student->PrimaryEmail,
                    'TemporaryPassword' => $Student->TemporaryPassword
                ];
            }
        } finally {
            unset($record);
            unset($Person);

            if ($result) {
                $result->free();
            }
            unset($result);
        }
    }
];