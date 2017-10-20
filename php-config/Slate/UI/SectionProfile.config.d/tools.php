<?php

Slate\UI\SectionProfile::$sources[] = function (Slate\Courses\Section $Section) {
    $links = [];

    if (!empty($GLOBALS['Session']) && $GLOBALS['Session']->hasAccountLevel('Staff')) {
        $links['Copy Email List'] = '#copy-section-emails';
        $links['Download Roster'] = $Section->getUrl().'/students?'.http_build_query([
            'format' => 'csv',
            'columns' => 'LastName,FirstName,Gender,Username,PrimaryEmail,PrimaryPhone,StudentNumber,Advisor,GraduationYear'
        ]);
    }

    return [
        'Course Tools' => $links
    ];
};