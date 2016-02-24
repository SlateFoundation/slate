<?php

namespace Slate\Progress\Narratives;

class Report extends \VersionedRecord
{
    // VersionedRecord configuration
    public static $historyTable = 'history_narrative_reports';

    // ActiveRecord configuration
    public static $tableName = 'narrative_reports';
    public static $singularNoun = 'narrative report';
    public static $pluralNoun = 'narrative reports';
    public static $collectionRoute = '/progress/narratives/reports';
    public static $updateOnDuplicateKey = true;
    public static $trackModified = true;

    // required for shared-table subclassing support
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'TermID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'CourseSectionID' => [
            'type' => 'integer',
            'unsigned' => true
        ],
        'StudentID' => [
            'type' => 'integer',
            'unsigned' => true
        ],

        'Status' => [
            'type' => 'enum',
            'values' => ['draft', 'published'],
            'default' => 'draft'
        ],
        'Updated' => [
            'type' => 'timestamp'
            ,'notnull' => false
        ],
        'Notes' => [
            'type' => 'clob',
            'notnull' => false
        ]
    ];


    public static $indexes = [
        'NarrativeReport' => [
            'fields' => ['TermID', 'CourseSectionID', 'StudentID'],
            'unique' => true
        ]
    ];

    public static $relationships = [
        'Section' => [
            'type' => 'one-one',
            'class' => \Slate\Courses\Section::class,
            'local' => 'CourseSectionID'
        ],
        'Student' => [
            'type' => 'one-one',
            'class' => \Slate\People\Student::class
        ],
        'Term' => [
            'type' => 'one-one',
            'class' => \Slate\Term::class
        ]
    ];

    public static $searchConditions = array(
        'narrativeID' => array(
            'qualifiers' => array('narrativeid')
            ,'points' => 2
            ,'sql' => 'ID=%u'
        )
        ,'termID' => array(
            'qualifiers' => array('termid')
            ,'points' => 2
            ,'sql' => 'TermID=%u'
        )
        ,'studentID' => array(
            'qualifiers' => array('studentid')
            ,'points' => 2
            ,'sql' => 'StudentID=%u'
        )
        ,'authorID' => array(
            'qualifiers' => array('authorid')
            ,'points' => 2
            ,'sql' => 'CreatorID=%u'
        )
        ,'advisorID' => array(
            'qualifiers' => array('advisorid')
            ,'points' => 2
            ,'sql' => 'StudentID in (Select ID from people where AdvisorID=%u)'
        )
    );

    public static $dynamicFields = array(
        'Student'
        ,'EmailRecipients' => array(
            'method' => 'getEmailRecipients'
        )
    );

    public function getEmailRecipients()
    {
        $recipients = [];
        $student = $this->Student;

        if ($student->PrimaryEmailID && \Validators::email($student->Email))
        {
            // TODO: do we want the email address or recipient name?
            $recipients[] = $student->EmailRecipient;
            //$recipients[] = $student->Email;
        }

        $recipientTypes = explode(',' , $_REQUEST['Recipients']);

        if (in_array('Advisor',$recipientTypes)) {
            $advisor = $student->Advisor;

            if ($advisor && $advisor->PrimaryEmailID && \Validators::email($advisor->Email)) {
                // TODO: do we want the email address or recipient name?
                $recipients[] = $student->Advisor->EmailRecipient;
                //$recipients[] = $student->Advisor->Email;
            }
        }

        if (in_array('Parents',$recipientTypes)) {

            $guardianRelationships = Relationship::getAllByWhere(array(
                'PersonID' => $student->ID
                ,'Class' => 'Emergence\\People\\GuardianRelationship'
            ));

            foreach($guardianRelationships as $guardianRelationship)
            {
                $relatedPerson = $guardianRelationship->RelatedPerson;
                if ($relatedPerson->PrimaryEmailID && \Validators::email($relatedPerson->Email))
                {
                    // TODO: do we want the email address or recipient name?
                    $recipients[] = $relatedPerson->EmailRecipient;
                    //$recipients[] = $relatedPerson->Email;
                }
            }
        }

        return $recipients;
    }
}
