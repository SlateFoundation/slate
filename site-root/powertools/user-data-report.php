<?php

use Emergence\People\IPerson;

// configure request/response
$GLOBALS['Session']->requireAccountLevel('Administrator');
set_time_limit(0);
header('Content-Type: text/html; charset=utf-8');

// get input scope
if (empty($_GET['person'])) {
    $Person = null;
} elseif (!$Person = PeopleRequestHandler::getRecordByHandle($_GET['person'])) {
    throw new OutOfBoundsException(sprintf('person "%s" not found', $_GET['person']));
}

?>

<form method="GET">
    <fieldset>
        <legend>Analyze a person record</legend>
        <div>
            <label>
                Person: <input type="text" name="person" value="<?=!empty($_GET['person']) ? htmlspecialchars($_GET['person']) : ''; ?>">
            </label>
        </div>
        <div>
            <input type="submit" value="Prepare report">
        </div>
    </fieldset>
</form>

<?php

function getRecordsForTable($Person, $tableName, $field = 'PersonID') {

    return DB::allRecords(
        'SELECT * FROM `%s` WHERE %u IN (%s)',
        [
            $tableName,
            $Person->ID,
            join(',', is_array($field) ? $field : [$field]),
        ]
    );
}

$reports = [
    'Enrollments' => function (IPerson $Person) {
        return getRecordsForTable($Person, Slate\Courses\SectionParticipant::$tableName);
    },
    'Comments' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\Comments\Comment::$tableName, 'CreatorID');
    },
    'Contact Points' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\People\ContactPoint\AbstractPoint::$tableName);
    },
    'Content Created/Authored' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\CMS\AbstractContent::$tableName, ['CreatorID', 'AuthorID']);
    },
    'Groups Assigned' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\People\Groups\GroupMember::$tableName);
    },
    'Invitations' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\People\Invitation::$tableName, 'RecipientID');
    },
    'Media Created' => function (IPerson $Person) {
        return getRecordsForTable($Person, Media::$tableName, 'CreatorID');
    },
    'Media Context' => function (IPerson $Person) {
        return DB::allRecords(
            'SELECT * FROM `%s` WHERE ContextClass = "%s" AND ContextID = %u',
            [
                Media::$tableName,
                DB::escape(Emergence\People\Person::class),
                $Person->ID
            ]
        );
    },
    'Messages Created/Authored' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\CRM\Message::$tableName, ['CreatorID', 'AuthorID']);
    },
    'Messages Received' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\CRM\MessageRecipient::$tableName);
    },
    'Relationships' => function (IPerson $Person) {
        return getRecordsForTable($Person, Emergence\People\Relationship::$tableName, ['PersonID', 'RelatedPersonID']);
    },
    'Interim Reports' => function (IPerson $Person) {
        return getRecordsForTable($Person, Slate\Progress\SectionInterimReport::$tableName, 'StudentID');
    },
    'Interim Reports Sent' => function (IPerson $Person) {
        $emailContactPointIDs = DB::allValues(
            'ID',
            'SELECT ID FROM `%s` WHERE Class = "%s" AND PersonID = %u',
            [
                Emergence\People\ContactPoint\Email::$tableName,
                DB::escape(Emergence\People\ContactPoint\Email::class),
                $Person->ID
            ]
        );

        if (empty($emailContactPointIDs)) {
            return [];
        }

        return DB::allRecords(
            'SELECT * FROM `%s` WHERE EmailContactID IN (%s)',
            [
                Slate\Progress\SectionInterimReportRecipient::$tableName,
                join(',', $emailContactPointIDs)
            ]
        );
    },
    'Term Reports' => function (IPerson $Person) {
        return getRecordsForTable($Person, Slate\Progress\SectionTermReport::$tableName, 'StudentID');
    },
    'Term Reports Sent' => function (IPerson $Person) {
        $emailContactPointIDs = DB::allValues(
            'ID',
            'SELECT ID FROM `%s` WHERE Class = "%s" AND PersonID = %u',
            [
                Emergence\People\ContactPoint\Email::$tableName,
                DB::escape(Emergence\People\ContactPoint\Email::class),
                $Person->ID
            ]
        );

        if (empty($emailContactPointIDs)) {
            return [];
        }

        return DB::allRecords(
            'SELECT * FROM `%s` WHERE EmailContactID IN (%s)',
            [
                Slate\Progress\SectionTermReportRecipient::$tableName,
                join(',', $emailContactPointIDs)
            ]
        );
    },
    'Tags' => function (IPerson $Person) {
        return DB::allRecords(
            'SELECT * FROM `%s` WHERE ContextClass = "%s" AND ContextID = %u',
            [
                TagItem::$tableName,
                DB::escape(Emergence\People\Person::class),
                $Person->ID
            ]
        );
    },
];

?>

<?php if ($Person) : ?>
    <h2>Data report for <?=htmlspecialchars($Person->FullName)?></h2>

    <dl>
    <?php foreach ($reports as $reportName => $reportFunction) : ?>
        <?php $records = $reportFunction($Person) ?>

        <dt><?=$reportName?></dt>
        <dd><?=count($records)?></dd>

    <?php endforeach ?>
    </dl>
<?php endif ?>
