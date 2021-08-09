<?php

use Slate\Term;
use Slate\TermsRequestHandler;

return [
    'title' => 'Slate Terms',
    'description' => 'Each row represents a term',
    'filename' => 'slate-terms',
    'headers' => [
        'StartDate' => 'Start Date',
        'EndDate' => 'End Date',
        'Title',
        'Handle',
        'Parent'
    ],
    'readQuery' => function (array $input) {
        $query = [
            'term' => ''
        ];

        if ($input['term'] == '*current') {
            if (!$Term = Term::getClosest()) {
                throw new OutOfBoundsException('no current term could be found');
            }

            $query['term'] = $Term->Handle;
        } elseif(!empty($input['term'])) {
            if (!$Term = TermsRequestHandler::getRecordByHandle($input['term'])) {
                throw new OutOfBoundsException('term not found');
            }

            $query['term'] = $Term->Handle;
        }

        return $query;
    },
    'buildRows' => function (array $query = [], array $config = []) {
        // build Term conditions
        $conditions = [];

        if ($query['term']) {
            if (!$ParentTerm = TermsRequestHandler::getRecordByHandle($query['term'])) {
                throw new Exception('term not found');
            }

            $conditions['Left'] = [
                'value' => $ParentTerm->Left,
                'operator' => '>='
            ];
            $conditions['Right'] = [
                'value' => $ParentTerm->Right,
                'operator' => '<='
            ];
        }

        $order = [
            'ID'
        ];

        $conditions = Term::mapConditions($conditions);

        // build rows
        $result = DB::query(
            '
                SELECT Term.*
                    FROM `%s` Term
                    WHERE (%s)
                    ORDER BY %s
            ',
            [
                Term::$tableName,
                count($conditions) ? join(') AND (', $conditions) : 'TRUE',
                implode(',', $order)
            ]
        );

        while ($record = $result->fetch_assoc()) {
            $Term = Term::instantiateRecord($record);

            yield [
                'StartDate' => $Term->StartDate,
                'EndDate' => $Term->EndDate,
                'Title' => $Term->Title,
                'Handle' => $Term->Handle,
                'Parent' => $Term->Parent ? $Term->Parent->Handle : null,
            ];
        }

        $result->free();
    }
];