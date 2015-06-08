<?php
/*
    Class meant for Filling the Site with Dummy Data
*/

use Slate\Progress\Note as ProgressNote;

use Slate\Progress\Standards\Prompt as StandardsPrompt;
use Slate\Progress\Standards\PromptGrade as StandardsPromptGrade;
use Slate\Progress\Standards\Worksheet as StandardsWorksheet;
use Slate\Progress\Standards\WorksheetPrompt as StandardsWorksheetPrompt;
use Slate\Progress\Standards\WorksheetAssignment as StandardsWorksheetAssignment;

use Slate\Progress\Narratives\Report as NarrativeReport;
use Slate\Progress\Narratives\WorksheetAssignment as NarrativeWorksheetAssignment;

use Slate\Progress\Interims\Report as InterimReport;

use Emergence\CRM\MessageRecipient as CRM_MessageRecipient;

use Emergence\People\Person;

use Emergence\People\Groups\Group;
use Emergence\People\Groups\Organization;
use Emergence\People\Groups\GroupMember;

class Populate
{
    const FirstNameList = '/demo-data/firstnames.txt';
    const LastNameList = '/demo-data/lastnames.txt';
    const StreetNameList = '/demo-data/streets.txt';
    const CitiesList = '/demo-data/cities.txt';
    const CourseList = '/demo-data/courses.txt';
    const BulkText = '/demo-data/bulktext.txt';
    const StandardsWorkksheetList = '/demo-data/standards_worksheets.json';

    public static function all()
    {
        set_time_limit(0);
        ini_set('memory_limit', '512M');
        $schoolYearArray = array(
            'numStudents' => 500
            ,'startYear' => 2015
            ,'numYears' => 6
        );
        static::People($schoolYearArray, 25, 3, 3);
        $courseResponse = static::createCourses(50, 25, 50, $schoolYearArray['startYear']);
        $Term = $courseResponse['terms']['Year Term'];

        static::FillCourseSections($Term);

#        static::createInterims($Term, 8);

#        static::createNarratives($Term, 2);

#        static::createStandards($Term, 2, 2);

#        static::createProgressNotes($Term, true);

#        static::createAssets();

#        static::fillCMSContent($Term, 3);

    }

    public static function createCMSContent($className, $data)
    {
        $bulktext =  file_get_contents(static::getFullUrl(self::BulkText));

        if (!$data['Title']) {
            $blogTitle = false;

            while (!$blogTitle) {
                $title = ucfirst(substr($bulktext, (rand(0, strlen($bulktext)-25)), 25));

                if (!Emergence\CMS\BlogPost::getByField('Title', $title)) {
                    $blogTitle = $title;
                }
            }

            $data['Title'] = $blogTitle;
        }

        return $className::create($data,true);

    }

    public static function createCMSContentItem($className, $data)
    {
        $bulktext =  file_get_contents(static::getFullUrl(self::BulkText));

        switch ($className) {
            case 'Emergence\CMS\Item\RichText':
                $data['Data'] = $bulktext;
                break;

            case 'Emergence\CMS\Item\Embed':
                $data['Data'] = '<iframe src="http://player.vimeo.com/video/63861325" width="500" height="281" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe> <p><a href="http://vimeo.com/63861325">Demo Video</a> from <a href="http://vimeo.com/user8443708">Christian Kunkel</a> on <a href="http://vimeo.com">Vimeo</a>.</p>';
                break;
        }

        return $className::create($data, true);
    }

    public static function fillCMSContent($YearTerm, $blogsPerStudent=2)
    {
        $tags = static::createTags();
        $blogpost = static::createBlogPost($YearTerm, $blogsPerStudent);
        $pages = static::createPages();
    }

    public static function createTags()
    {
        $tags = array();
        $tagTitles = array(
            'Homepage'
        );

        foreach ($tagTitles as $tagTitle) {
            $tagData = array(
                'Title' => $tagTitle
            );
            if(!$Tag = Tag::getByWhere($tagData))
            {
                $Tag = Tag::create($tagData, true);
            }

            $tags[] = $Tag;
        }

        return $tags;
    }

    public static function createPages()
    {
        $pages = array();
        $pageTitles = array(
            'Mission and Vision'
            ,'Admissions'
            ,'Activities'
            ,'About'
            ,'Curriculum'
            ,'Counseling'
            ,'Technical Support'
            ,'Partnerships'
        );

        foreach ($pageTitles as $pageTitle) {

            if (!$Page = Emergence\CMS\Page::getByField('Title', $pageTitle)) {
                $Page = static::createCMSConent('Emergence\CMS\BlogPost', array(
                    'Title' => $pageTitle
                    ,'Published' => time()
                    ,'Status' => 'Published'
                    ,'LayoutClass' => 'OneColumn'
                    ,'Visibility' => 'Public'
                ));
            }

            $contentItems = Emergence\CMS\Item\AbstractItem::getAllByField('ContentID', $Page->ID);
            $itemAmount = 2 - count($contentItems);

            while ($itemAmount > 0) {
                $itemData = array(
                    'ContentID' => $Page->ID
                    ,'AuthorID' => $Page->AuthorID
                    ,'Status' => 'Published'
                    ,'Class' => rand(0,9) ? 'Emergence\CMS\Item\RichText' : 'Emergence\CMS\Item\Embed'
                );

                $Item = static::createCMSContentItem($itemData['Class'], $itemData);

                $itemAmount--;
            }

            $pages[] = $Page->ID;
        }

        return $pages;
    }

    public static function createBlogPost($YearTerm, $blogsPerStudent=2)
    {
        $blogs = array();
        $students = Slate\People\Student::getAllByField('Class', Slate\People\Student::class);
        $startTime = strtotime($YearTerm->StartDate);
        $endTime = strtotime($YearTerm->EndDate);
        $bulktext =  file_get_contents(static::getFullUrl(self::BulkText));

        foreach ($students as $Student) {
            $Sections = Slate\Courses\Section::getAllByQuery('SELECT Section.* FROM `%s` Participant JOIN `%s` Section ON (Section.ID = Participant.CourseSectionID) WHERE Participant.PersonID=%u AND Role="Student"', array(
                Slate\Courses\SectionParticipant::$tableName
                ,Slate\Courses\Section::$tableName
                ,$Student->ID
            ));


            $studentBlogCount = DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE AuthorID=%u AND DATE(Created) BETWEEN "%s" AND "%s"',array(
                Emergence\CMS\BlogPost::$tableName
                ,$Student->ID
                ,$YearTerm->StartDate
                ,$YearTerm->EndDate
            ));

            $contentAmount = ($blogsPerStudent && is_bool($blogsPerStudent)) ? 2 - $studentBlogCount : $blogsPerStudent - $studentBlogCount;

            while ($contentAmount > 0) {
                $Context = rand(0,9) ? $Sections[array_rand($Sections)] : false;
                $createdTime = rand($startTime, $endTime);

                $blogData = array(
                    'CreatorID' => $Student->ID
                    ,'ContextClass' => $Context ? $Context->Class : false
                    ,'ContextID' => $Context ? $Context->ID : false
                    ,'AuthorID' => $Student->ID
                    ,'Published' => $createdTime
                    ,'Created' => $createdTime
                    ,'LayoutClass' => 'OneColumn'
                    ,'Visibility' => rand(1,9) > 2 ? 'Public' : 'Private'
                );


                $Blog = static::createCMSContent('Emergence\CMS\BlogPost', $blogData);
                $itemAmount = 2;

                while ($itemAmount > 0) {
                    $itemData = array(
                        'ContentID' => $Blog->ID
                        ,'AuthorID' => $Student->ID
                        ,'Status' => 'Published'
                        ,'Created' => $blogData['Created']
                        ,'Class' => rand(0,9) ? 'Emergence\CMS\Item\RichText' : 'Emergence\CMS\Item\Embed'
                    );

                    $Item = static::createCMSContentItem($itemData['Class'], $itemData);

                    $itemAmount--;
                }


                $blogs[] = $Blog->ID;
                $contentAmount--;
            }
        }

        return $blogs;
    }

    public static function getFullUrl($path)
    {
        return ($_SERVER['HTTPS'] ? 'https://' : 'http://').$_SERVER['HTTP_HOST'].$path;
    }

    public static function createSerial($amount=10)
    {
        $chars = array(0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
        $serial = '';
        for ($i=0;$i<$amount;$i++) {
            $serial .= $chars[rand(0, (count($chars)-1))];
        }

        return $serial;
    }

    public static function createAssetLocations()
    {
        $locations = array();
        $locationTitles = array(
            'With Staff'
            ,'With Student'
            ,'See Status'
            ,'Workbench A'
            ,'Workbench B'
            ,'Workbench C'
            ,'Storage'
            ,'Repair Cart'
        );

        foreach ($locationTitles as $locationTitle) {
            $locationData = array(
                'Title' => $locationTitle
            );

            if (!$Location = AssetLocation::getByWhere($locationData)) {
                $locationData['Status'] = 'Active';
                $Location = AssetLocation::create($locationData, true);
            }

            $locations[] = $Location;
        }

        return $locations;
    }

    public static function createAssetStatuses()
    {
        $statuses = array();
        $statusTitles = array(
            'Checked-out for Summer'
            ,'Ready for Distribution'
            ,'Missing'
            ,'Stolen'
            ,'Retired'
            ,'Loaned'
            ,'Deployed'
            ,'Broken'
        );

        foreach ($statusTitles as $statusTitle) {
            $statusData = array(
                'Title' => $statusTitle
            );
            
            if (!$Status = Slate\Assets\Status::getByWhere($statusData)) {
                $statusData['Status'] = 'Active';
                $Status = Slate\Assets\Status::create($statusData, true);
            }

            $statuses[] = $Status;
        }

        return $statuses;
    }

    public static function createAssets()
    {
        $People = Emergence\People\User::getAllByWhere('AccountLevel IN ("Staff", "Student", "Administrator", "Teacher")');
        $schoolGroup = Organization::getByField('Name', 'Demo School');
        $locations = static::createAssetLocations();
        $statuses = static::createAssetStatuses();
        $assets = array();
        $aliases = array();


        foreach ($People as $Person) {
            $assetData = array(
                'OwnerClass' => $schoolGroup->Class
                ,'OwnerID' => $schoolGroup->ID
                ,'AssigneeID' => $Person->ID
                ,'AssigneeClass' => $Person->Class
            );
            $Status = $statuses[array_rand($statuses)];
            $Location = $locations[array_rand($locations)];

            $MacAddress = static::createSerial(12);
            $MfrSerial = static::createSerial(11);

            if (!$Asset = Slate\Assets\Asset::getByWhere($assetData)) {
                $Asset = Slate\Assets\Asset::create(array_merge($assetData, array(
                    'Data' => array(
                        'Manafacturer' => 'Devnuts'
                        ,'Model' => 'DevBooks'
                    )
                    ,'StatusID' => $Status->ID
                    ,'LocationID' => $Location->ID
                )), true);
            }

            $serialAlias = static::createAssetAlias($Asset, 'MfrSerial', $MfrSerial);
            $macAlias = static::createAssetAlias($Asset, 'MacAddress', $MacAddress);

            $assets[] = $Asset;
            $aliases[] = $macAlias;
            $aliases[] = $serialAlias;

        }

        return $assets;
    }

    public static function createAssetAlias($Asset, $type, $identifier)
    {
        $aliasData = array(
            'Type' => $type
            ,'ObjectClass' => $Asset->Class
            ,'ObjectID' => $Asset->ID
        );

        if (!$Alias = Slate\Assets\Alias::getByWhere($aliasData)) {
            $Alias = Slate\Assets\Alias::create(array_merge($aliasData, array(
                'Identifier' => $identifier
                ,'Data' => $type=='MacAddress' ? array((rand(0,1) ? "Wired" : "Wireless")) : null
            )), true);

            $Alias->save();
        }
        return $Alias;
    }

    public static function createProgressNotes($YearTerm, $maxPerStudent=5)
    {
        $Students = Slate\People\Student::getAllByField('Class', Slate\People\Student::class);
        $bulktext =  file_get_contents(static::getFullUrl(self::BulkText));
        $termIDs = $YearTerm->getContainedTermIDs();
        $startTime = strtotime($YearTerm->StartDate);
        $endTime = strtotime($YearTerm->EndDate);

        $notes = array();
        
        foreach ($Students as $Student) {
            $progressNoteData = array(
                'ContextClass' => Emergence\People\Person::class
                ,'ContextID' => $Student->ID
            );

            $progressNoteCount = DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE ContextClass="Person" AND ContextID=%u AND DATE(Created) BETWEEN "%s" AND "%s"', array(
                    ProgressNote::$tableName
                    ,$Student->ID
                    ,$YearTerm->StartDate
                    ,$YearTerm->EndDate
            ));

            $amount = ($maxPerStudent && is_bool($maxPerStudent) ? 5 - $progressNoteCount : $maxPerStudent - $progressNoteCount);
            while ($amount > 0) {
                $createdTime = rand($startTime, $endTime);

                $Note = ProgressNote::create(array_merge($progressNoteData, array(
                    'Status' => 'Sent'
                    ,'Created' => $createdTime
                    ,'Sent' => $createdTime + 4
                    ,'Title' => ucfirst(substr($bulktext, (rand(0, strlen($bulktext)-25)), 25))
                    ,'Source' => 'Direct'
                    ,'MessageFormat' => 'plain'
                    ,'Message' => $bulktext
                    ,'Subject' => substr($bulktext, 0, 25)
                )),true);

                $notes[] = $Note->ID;

                $recipientData = array(
                    'MessageID' => $Note->ID
                );

                if (!$Recipient = CRM_MessageRecipient::getByWhere($recipientData)) {
                    $Recipient = CRM_MessageRecipient::create(array_merge($recipientData, array(
                        'Status' => 'Sent'
                        ,'Source' => 'Direct'
                        ,'PersonID' => $Student->ID
                    )),true);
                }
                $amount--;
            }
        }

        return $notes;
    }

    public static function createStandardWorksheets()
    {
        $worksheets = json_decode(file_get_contents(static::getFullUrl(self::StandardsWorkksheetList)), true);

        $existingWorksheets = array();

        foreach ($worksheets as $key => $Worksheet) {
            if (!$ExistingWorksheet = StandardsWorksheet::getByWhere(array('Title'=>$Worksheet['Title']))) {
                $ExistingWorksheet = StandardsWorksheet::create(array(
                    'Title' => $Worksheet['Title']
                    ,'Description' => $Worksheet['Description']
                    ,'Status' => 'Live'
                ), true);
            }

            foreach ($Worksheet['Prompts'] as $Prompt) {
                if (!$ExistingPrompt = StandardsPrompt::getByWhere(array('Prompt'=>$Prompt))) {
                    $ExistingPrompt = StandardsPrompt::create(array(
                        'Prompt' => $Prompt
                        ,'Status' => 'Live'
                    ), true);
                }

                $assignmentData = array(
                    'WorksheetID'=>$ExistingWorksheet->ID
                    ,'PromptID'=>$ExistingPrompt->ID
                );

                if (!$PromptAssignment = StandardsWorksheetPrompt::getByWhere($assignmentData)) {
                    $PromptAssignment = StandardsWorksheetPrompt::create($assignmentData, true);
                }
            }

            $existingWorksheets[$key] = $ExistingWorksheet;
        }

        return $existingWorksheets;
    }

    public static function createStandards($YearTerm, $maxAssignedWorksheets=1, $maxStudentsPerWorksheet=10)
    {
        $worksheets = json_decode(file_get_contents(static::getFullUrl(self::StandardsWorkksheetList)), true);

        $existingWorksheets = static::createStandardWorksheets();
        $termIDs = $YearTerm->getContainedTermIDs();

        $Sections = Slate\Courses\Section::getAll(['TermID IN ('.implode(',', $termIDs).')']);
        $grades = array('1', '2', '3', '4', 'N/A');

        foreach ($Sections as $Section) {
            $SectionWorksheet = $existingWorksheets[$Section->Course->Department->Title];
            $sectionTermIDs = $Section->Term->getContainedTermIDs();
            $sectionStudents = $Section->Students;

            $sectionWorksheetAssignments = StandardsWorksheetAssignment::getAllByWhere(array(
                'CourseSectionID' => $Section->ID
                ,'TermID IN ('.implode(',', $sectionTermIDs).')'
            ));

            $sectionAssignmentCount = count($sectionWorksheetAssignments);

            $worksheetAmount = ($maxAssignedWorksheets && is_bool($maxAssignedWorksheets)) ? (count($sectionStudents) - $sectionAssignmentCount)  : ($maxAssignedWorksheets - $sectionAssignmentCount);

            while ($worksheetAmount > 0) {
                if (!$SectionWorksheet) {
                    $worksheetAmount = 0;
                    continue;
                }

                $worksheetAssignmentData = array(
                    'CourseSectionID' => $Section->ID
                    ,'WorksheetID' => $SectionWorksheet->ID
                );

                $foundAssignmentSlot = false;

                for ($i=0; $i<count($sectionTermIDs) && !$foundAssignmentSlot; $i++) {
                    $sectionTermID = $sectionTermIDs[$i];

                    $worksheetAssignmentData['TermID'] = $sectionTermID;

                    if (!$WorksheetAssignment = StandardsWorksheetAssignment::getByWhere($worksheetAssignmentData)) {
                        $WorksheetAssignment = StandardsWorksheetAssignment::create($worksheetAssignmentData, true);
                        $sectionWorksheetAssignments[] = $WorksheetAssignment;
                        $foundAssignmentSlot = true;
                    }

                }

                if (!$foundAssignmentSlot) {
                    $worksheetAmount = 0;
                    continue;
                }

                $worksheetAmount--;
            }

            foreach ($sectionWorksheetAssignments as $sectionWorksheetAssignment) {
                $worksheetStudents = $sectionStudents;
                $prompts = $sectionWorksheetAssignment->Worksheet->Prompts;
                $promptIDs = array_map(function($prompt){
                    return $prompt->ID;
                },$prompts);

                $gradedStudents = DB::allRecords('SELECT *, (SELECT COUNT(*) FROM `%s` Grade WHERE Grade.StudentID=Person.ID AND CourseSectionID=%u AND TermID=%u AND PromptID IN (%s) AND Grade IS NOT NULL) AS PromptsGraded FROM `%s` Person HAVING PromptsGraded=%u ', array(
                    StandardsPromptGrade::$tableName
                    ,$sectionWorksheetAssignment->CourseSectionID
                    ,$sectionWorksheetAssignment->TermID
                    ,implode(',',$promptIDs)
                    ,Person::$tableName
                    ,count($prompts)
                ));

                $gradedStudentsID = array_map(function($student){
                    return $Student['ID'];
                }, $gradedStudents);

                $gradedStudentCount = count($gradedStudents);

                $gradeAmount = ($maxStudentsPerWorksheet && is_bool($maxStudentsPerWorksheet)) ? (count($sectionStudents) - $gradedStudentCount)  : ($maxStudentsPerWorksheet - $gradedStudentCount);

                while ($gradeAmount > 0) {
                    $Student = false;

                    while (!$Student) {
                        if (!count($worksheetStudents)) {
                            break;
                        }

                        $randStudentKey = array_rand($worksheetStudents);
                        $randStudent = $worksheetStudents[$randStudentKey];

                        if (!in_array($randStudent->ID, $gradedStudentsID)) {
                            $Student = $randStudent;
                        } else {
                            unset($worksheetStudents[$randStudentKey]);
                        }
                    }

                    if (!$Student) {
                        $gradeAmount = 0;
                        continue;
                    }

                    foreach ($prompts as $Prompt) {
                        $gradeData = array(
                            'PromptID' => $Prompt->ID
                            ,'CourseSectionID' => $Section->ID
                            ,'TermID' => $sectionWorksheetAssignment->TermID
                            ,'StudentID' => $Student->ID
                        );

                        if (!$PromptGrade = StandardsPromptGrade::getByWhere($gradeData)) {
                            $PromptGrade = StandardsPromptGrade::create(array_merge($gradeData, array(
                                'Grade' => $grades[array_rand($grades)]
                            )), true);
                        }
                    }

                    $gradeAmount--;
                }
            }

        }
    }

    public static function createInterims($YearTerm, $maxPerClass=5)
    {
        $bulktext =  file_get_contents(static::getFullUrl(self::BulkText));
        $termIDs = $YearTerm->getContainedTermIDs();
        $Sections = Slate\Courses\Section::getAll(['TermID IN ('.implode(',', $termIDs).')']);

        $interims = array();

        foreach ($Sections as $Section) {
            $sectionTermIDs = $Section->Term->getContainedTermIDs();
            $sectionStudents = $Section->Students;
            $interimData = array(
                'CourseSectionID' => $Section->ID
            );

            $sectionInterimData = array_merge($interimData, array('TermID IN ('.implode(',', $sectionTermIDs).')'));

            $sectionInterims = InterimReport::getAllByWhere($sectionInterimData);
            $sectionInterimsCount = count($sectionInterims);

            $amount = ($maxPerClass && is_bool($maxPerClass)) ? (count($sectionStudents) - $sectionInterimsCount)  : ($maxPerClass - $sectionInterimsCount);


            while ($amount > 0) {
                $Student = false;
                $TermID = false;
                $foundEmptySpot = false;

                while (!$foundEmptySpot) {
                    $randStudentKey = array_rand($sectionStudents);
                    $randStudent = $sectionStudents[$randStudentKey];

                    for ($i=0;$i<count($sectionTermIDs) && !$Student && !$TermID; $i++) {
                        $sectionTermID = $sectionTermIDs[$i];

                        if (!InterimReport::getByWhere(array_merge($interimData, array('TermID'=>$sectionTermID,'StudentID'=>$randStudent->ID)))) {
                            $Student = $randStudent;
                            $TermID = $sectionTermID;
                            $foundEmptySpot = true;
                        }
                    }

                    if (!$Student) {
                        unset($sectionStudents[$randStudentKey]);
                    }
                }

                if (!$foundEmptySpot) {
                    $amount = 0;
                    continue;
                }
                
                $Interim = InterimReport::create(array_merge($interimData, [
                    'Grade' => rand(1,10) > 2 ? (rand(0,1) ? 'D' : 'F') : 'N/A'
                    ,'Status' => rand(1,10) > 3 ? 'Published' : 'Draft'
                    ,'Comments' => $bulktext
                    ,'TermID' => $TermID
                    ,'StudentID' => $Student->ID
                ]), true);

                $interims[] = $Interim->ID;

                $amount--;
            }
        }
        return $interims;
    }

    public static function createNarratives($YearTerm, $maxPerClass=5)
    {
        $bulktext =  file_get_contents(static::getFullUrl(self::BulkText));

        $termIDs = $YearTerm->getContainedTermIDs();
        $Sections = Slate\Courses\Section::getAll(['TermID IN ('.implode(',', $termIDs).')']);
        $grades = array('A','B','C','D','F','Inc');
        $narratives = array();

        foreach ($Sections as $Section) {
            $sectionTermIDs = $Section->Term->getContainedTermIDs();
            $sectionStudents = $Section->Students;
            $narrativeData = array(
                'CourseSectionID' => $Section->ID
            );
            $sectionNarrativeData = array_merge($narrativeData, array('TermID IN ('.implode(',', $sectionTermIDs).')'));

            $sectionNarratives = NarrativeReport::getAllByWhere($sectionNarrativeData);
            $sectionNarrativeCount = count($sectionNarratives);

            $amount = ($maxPerClass && is_bool($maxPerClass)) ? (count($sectionStudents) - $sectionNarrativeCount)  : ($maxPerClass - $sectionNarrativeCount);

            while ($amount > 0) {
                $Student = false;
                $TermID = false;
                $foundEmptySpot = false;

                while (!$foundEmptySpot) {
                    $randStudentKey = array_rand($sectionStudents);
                    $randStudent = $sectionStudents[$randStudentKey];

                    for ($i=0;$i<count($sectionTermIDs) && !$Student && !$TermID; $i++) {
                        $sectionTermID = $sectionTermIDs[$i];

                        if (!NarrativeReport::getByWhere(array_merge($narrativeData, array('TermID'=>$sectionTermID,'StudentID'=>$randStudent->ID)))) {
                            $Student = $randStudent;
                            $TermID = $sectionTermID;
                            $foundEmptySpot = true;
                        }
                    }

                    if (!$Student) {
                        unset($sectionStudents[$randStudentKey]);
                    }
                }

                if (!$foundEmptySpot) {
                    $amount = 0;
                    continue;
                }

                $Narrative = NarrativeReport::create(array_merge($narrativeData, array(
                    'Status' => rand(1,10) > 3 ? 'Published' : 'Draft'
                    ,'Grade' => $grades[array_rand($grades)]
                    ,'Assessment' => $bulktext
                    ,'Comments' => $bulktext
                    ,'TermID' => $TermID
                    ,'StudentID' => $Student->ID
                )), true);

                $narratives[] = $Narrative->ID;

                $amount--;
            }
        }
        return $narratives;
    }

    public static function createCourseDepartments()
    {
        $departments = array();

        foreach (Slate\Courses\Department::getAll() as $department) {
            $departments[$department->Title] = $department;
        }

        return $departments;
    }

    public static function createCourseSchedules()
    {
        if (!$schedules = Slate\Courses\Schedule::getAll()) {
            $scheduleTitles = array('A','B','C','D','E','X','Y','Wed');

            foreach ($scheduleTitles as $title) {
                $Schedule = new Slate\Courses\Schedule;

                $Schedule->Title = $title;

                $Schedule->save();

                $schedules[] = $Schedule;
            }
        }

        return $schedules;
    }

    public static function createCourseLocations()
    {
        $locationClassName = new Emergence\Locations\Location;
        
        $staffLastNames = DB::allRecords('SELECT DISTINCT(LastName) FROM `people` WHERE `AccountLevel` IN ("Staff", "Administrator")');

        $staffLastNames = array_map(function($person){
            return $person['LastName'];
        },$staffLastNames);

        if (!$SchoolLocation = $locationClassName::getByHandle('demo_school')) {
            $SchoolLocation = $locationClassName::create(array(
                'Title'    =>    'Demo School'
                ,'Status' => 'Live'
            ),true);
        }

        $roomCount = 12;
        $floorCount = count($staffLastNames) / $roomCount;

        if (!$locations = $locationClassName::getAllByWhere(array('ParentID'=>$SchoolLocation->ID))) {
            for ($floor=1; $floor<$floorCount && !empty($staffLastNames); $floor++) {
                for ($room=0; $room<$roomCount && !empty($staffLastNames); $room++) {
                    $roomNumber = $floor.str_pad($room, 2, 0, STR_PAD_LEFT);
                    $staffName = array_shift($staffLastNames);

                    $Location = $locationClassName::create(array(
                        'Title' =>     $roomNumber. ' ('.$staffName.')'
                        ,'Handle' => strtolower($staffName).'_'.$roomNumber
                        ,'ParentID' => $SchoolLocation->ID
                    ), true);

                    $locations[$staffName] = $Location;
                }
            }

        }

        return $locations;
    }

    public static function createTerms($startYear=false)
    {
        $currentDay = date('d');
        $currentMonth = date('m');

        $startYear = $startYear ? new DateTime('10 September '.$startYear) : new DateTime('10 September '.date('Y'));
        $endYear = $startYear ? new DateTime('17 June '.date('Y',($startYear->format('U') + (365 * 24 * 60 * 60)))) :  new DateTime('17 June '.date('Y',(time() + (365 * 24 * 60 * 60))));

        $halfYear = clone $startYear;

        $schoolDays = date_diff($endYear, $startYear)->format('%a');
        $halfYear = $halfYear->modify('+'.($schoolDays/2).' Days');


        $schoolYearTitle = $startYear->format('Y').'-'.$endYear->format('y');

        $terms = array();

        if (!$YearTerm = Slate\Term::getByWhere(array('Title' => $schoolYearTitle))) {
            $YearTerm = Slate\Term::create(array(
                'Title' =>     $schoolYearTitle
                ,'StartDate' => $startYear->format('U')
                ,'EndDate' => $endYear->format('U')
                ,'Status' => 'Live'
            ), true);
        }

        $terms['Year Term'] = $YearTerm;

        for ($semester=1; $semester<=2; $semester++) {

            $semesterStartDate = $semester==1 ? $YearTerm->StartDate : $halfYear->modify('+1 Days')->format('Y-m-d');
            $semesterEndDate = $semester==2 ? $YearTerm->EndDate : $halfYear->format('Y-m-d');

            $semesterData = array(
                'Title' =>     $schoolYearTitle.'.S'.$semester
                ,'StartDate' => $semesterStartDate
                ,'EndDate' =>  $semesterEndDate
                ,'Status' => 'Live'
                ,'ParentID' => $YearTerm->ID
            );

            if (!$SemesterTerm = Slate\Term::getByWhere($semesterData)) {
                $SemesterTerm = Slate\Term::create($semesterData,true);
            }
            $terms[] = $SemesterTerm;

            for ($i=1; $i<=2; $i++) {
                $quarter = $semester==1 ? $i : $i+$semester;
                $quarterTitle = '';
                $quarterStartDate = '';
                $quarterEndDate = '';

                switch ($quarter) {
                    case 1:
                        $quarterStartDate = $SemesterTerm->StartDate;
                        $quarterEndDate = date_create($SemesterTerm->StartDate)->modify('+'.($schoolDays/4).' Days')->format('Y-m-d');
                        $quarterTitle = $schoolYearTitle.': '.$quarter.'st Quarter';
                        break;

                    case 2:
                        $quarterStartDate = date_create($SemesterTerm->StartDate)->modify('+'.($schoolDays/4 + 1).' Days')->format('Y-m-d');
                        $quarterEndDate = $SemesterTerm->EndDate;
                        $quarterTitle = $schoolYearTitle.': '.$quarter.'nd Quarter';
                        break;

                    case 3:
                        $quarterStartDate = $SemesterTerm->StartDate;
                        $quarterEndDate = date_create($SemesterTerm->StartDate)->modify('+'.($schoolDays/4).' Days')->format('Y-m-d');
                        $quarterTitle = $schoolYearTitle.': '.$quarter.'rd Quarter';
                        break;

                    case 4:
                        $quarterStartDate = date_create($SemesterTerm->StartDate)->modify('+'.($schoolDays/4 + 1).' Days')->format('Y-m-d');
                        $quarterEndDate = $SemesterTerm->EndDate;
                        $quarterTitle = $schoolYearTitle.': '.$quarter.'th Quarter';
                        break;
                }
                $quarterData = array(
                    'Title' => $quarterTitle
                    ,'StartDate' => $quarterStartDate
                    ,'EndDate' => $quarterEndDate
                    ,'ParentID' => $SemesterTerm->ID
                );

                if (!$QuarterTerm = Slate\Term::getByWhere($quarterData)) {
                    $QuarterTerm = Slate\Term::create($quarterData, true);
                }

                $terms[] = $QuarterTerm;
            }
        }
#        NestingBehavior::repairTable(CourseTerm::$tableName);

        $terms = array_map(function($term){
            return Slate\Term::getByID($term->ID);
        }, $terms);

        return $terms;
    }

    public static function createCourses($sectionAmount=50, $minParticipants=25, $maxParticipants=50, $schoolYear=false)
    {
        $terms = static::createTerms($schoolYear);
        $departments = static::createCourseDepartments();
        $schedules = static::createCourseSchedules();
        $locations = static::createCourseLocations();
        $termIDs = array_map(function($Term){
            return $Term->ID;
        },$terms);
        $demoCourses =  file(static::getFullUrl(self::CourseList));

        $courses = array();
        $courseSections = Slate\Courses\Section::getAllByWhere('TermID IN ('.implode(',',$termIDs).')');

        $locations = Emergence\Locations\Location::getAll();
        $staff = Emergence\People\Person::getAllByWhere(array('AccountLevel IN ("Staff", "Administrator", "Teacher")'));

        foreach (Slate\Courses\Course::getAll() as $course) {
            $courses[$course->Title] = $course;
        }

        foreach ($courseSections as $key=>$courseSection) {
            $courseSections[$courseSection->Title] = $courseSection;
            unset($courseSections[$key]);
        }


        $sectionAmount -= $courseSections ? count($courseSections) : 0;

        $demoCourses = array_map(function($course) {
            $courseData = explode(',',$course);

            return array(
                'Title' => trim($courseData[0])
                ,'Code' => trim($courseData[1])
                ,'DepartmentTitle' => trim($courseData[2])
            );
        }, $demoCourses);

        $newCourses;

        foreach ($demoCourses as $demoCourse) {
            if (!$courses[$demoCourse['Title']]) {
                $Course = new Slate\Courses\Course();

                if (!$departments[$demoCourse['DepartmentTitle']]) {
                    $Department = new Slate\Courses\Department();

                    $Department->setFields(array(
                        'Title' => $demoCourse['DepartmentTitle']
                        ,'Status' => 'Live'
                    ));
                    $Department->save();

                    $departments[$Department->Title] = $Department;
                }

                $Course->setFields(array(
                    'Title' => $demoCourse['Title']
                    ,'Code' => $demoCourse['Code']
                    ,'Status' => 'Live'
                    ,'DepartmentID' => $departments[$demoCourse['DepartmentTitle']]->ID
                ));

                $Course->save();
                $newCourses++;
                $courses[] = $Course->ID;
            }
        }

        $newCourseSections;

        while ($sectionAmount > 0) {
            $Teacher = $staff[array_rand($staff)];
            $CourseID = $courses[array_rand($courses)];
            $Schedule = $schedules[array_rand($schedules)];
            $Location = $locations[$Teacher->LastName] ? $locations[$Teacher->LastName] : $locations[array_rand($locations)];
            $Term =  $terms[array_rand($terms)];

            $Section = Slate\Courses\Section::create(array(
                'Title' => $Course->Title . ' - ' . $Teacher->LastName
                ,'CourseID' => $CourseID
                ,'Status' => 'Live'
                ,'TermID' => $Term->ID
                ,'LocationID' => $Location->ID
                ,'ScheduleID' => $Schedule->ID
                ,'StudentsCapacity' => rand($minParticipants, $maxParticipants)
            ), true);

            $newCourseSetions++;

            $participantData = array(
                'PersonID' => $Teacher->ID
                ,'CourseSectionID' => $Section->ID
                ,'Role' => 'Teacher'
            );

            if (!$Participant = Slate\Courses\SectionParticipant::getByWhere($participantData)) {
                $Participant = Slate\Courses\SectionParticipant::create($participantData,true);
            }

            $courseSections[] = $Section->ID;
            $sectionAmount--;
        }


        return array(
            'courses' => $courses
            ,'sections' => $courseSections
            ,'locations' => $locations
            ,'departments' => $departments
            ,'schedules' => $schedules
            ,'terms' => $terms
            ,'new' => array(
                'courses' => $newCourses,
                'sections' => $newCourseSections
            )
        );
    }

    public static function People($students=array(), $teachers=25,  $staff=2, $administrators=2)
    {
        $newStaff = static::createStaff($staff, 'Staff');
        $newTeachers = static::createStaff($teachers, 'Teacher');
        $newAdministrators = static::createStaff($administrators, 'Administrator');
        $newStudents = static::createStudents($students['numStudents'], $students['startYear'], $students['numYears']);

        return array(
            'Students' => $newStudents,
            'Administrators' => $newAdministrators,
            'Teachers' => $newTeachers,
            'Staff' => $newStaff
        );
    }

    public static function createStaff($staff=25, $type)
    {
        $addressContactPointClass = new Emergence\People\ContactPoint\Postal();
        $phoneContactPointClass = new Emergence\People\ContactPoint\Phone();
        $emailContactPointClass = new Emergence\People\ContactPoint\Email();
        
        if (!$StaffGroup = Group::getByHandle(strtolower($type))) {
            if (!$SchoolGroup = Organization::getByHandle('demo_school')) {
                $SchoolGroup = Organization::create(array(
                    'Name'    =>    'Demo School'
                ),true);
            }

            $StaffGroup = Group::create(array(
                'Name'    =>  $type
                ,'ParentID' => $SchoolGroup->ID
            ),true);
        }

        $staffCount = DB::oneValue('SELECT COUNT(*) FROM `people` WHERE `Class`="User" AND `AccountLevel`="%s"', array(
            $type
        ));

        $amount = $staff - $staffCount;

        $FirstNames = file(static::getFullUrl(self::FirstNameList));
        $LastNames = file(static::getFullUrl(self::LastNameList));
        $Streets = file(static::getFullUrl(self::StreetNameList));
        $newStaff = array();
        $Cities = file(static::getFullUrl(self::CitiesList));
        $StreetTypes = array('St','Dr','Ave','Pl');

        while ($amount > 0) {

            $FirstName = trim($FirstNames[array_rand($FirstNames)]);
            $LastName = trim($LastNames[array_rand($LastNames)]);
            $cityData = explode(',',$Cities[array_rand($Cities)]);
            $password = static::createPassword();



            $TeacherAddressData = array(
                'Postal' => str_pad(trim($cityData[0]), 5, 0, STR_PAD_LEFT)
                ,'State' => trim($cityData[2])
                ,'City' => ucwords(strtolower(trim($cityData[1])))
                ,'Number' => rand(1,3500)
                ,'Street' => trim($Streets[array_rand($Streets)]) . ' ' . $StreetTypes[array_rand($StreetTypes)]
            );

            // Create Teacher
            $Teacher = Emergence\People\User::create(array(
                'FirstName'            => $FirstName
                ,'LastName'            => $LastName
                ,'Gender'            => rand(0,1)?'Male':'Female'
                ,'AccountLevel'        => $type
                ,'Password'            => password_hash($password, PASSWORD_DEFAULT)
                ,'AssignedPassword'    => $password
                ,'Username' => Emergence\People\User::getUniqueUsername($FirstName, $LastName)
            ),true);


            $GroupMembership = GroupMember::create(array(
                'GroupID'    =>    $StaffGroup->ID
                ,'Role'        =>    'Member'
                ,'PersonID'    =>    $Teacher->ID
            ),true);

            $TeacherEmail = $Teacher->Username . '@example.com';
            $TeacherPhoneNumber = (rand(0,1)?'215':'267').'-'.rand(100,999).'-'.rand(1000,9999);

            $TeacherEmailContactPoint = $emailContactPointClass::create(array(
                'PersonID'    =>    $Teacher->ID
                ,'Label' => 'School Email'
            ));            
            $TeacherEmailContactPoint->address = $TeacherEmail;
            
            $TeacherPhoneContactPoint = $phoneContactPointClass::create(array(
                'PersonID'    =>    $Teacher->ID
                ,'Label' =>  rand(0,1) ? 'Home Phone' : 'Mobile Phone'
            ));
            $TeacherPhoneContactPoint->number = $TeacherPhoneNumber;
            
            $TeacherAddressContactPoint = $addressContactPointClass::create(array(
                'PersonID'    =>    $Teacher->ID
                ,'Label' => 'Home Address'
            ));
            $TeacherAddressContactPoint->city = $TeacherAddressData['City'];
            $TeacherAddressContactPoint->state = $TeacherAddressData['State'];
            $TeacherAddressContactPoint->postal = $TeacherAddressData['Postal'];
            $TeacherAddressContactPoint->number = $TeacherAddressData['Number'];
            $TeacherAddressContactPoint->street = $TeacherAddressData['Street'];
            
            $Teacher->PrimaryEmail = $TeacherEmailContactPoint;
            $Teacher->PrimaryPhone = $TeacherPhoneContactPoint;
            $Teacher->PrimaryPostal = $TeacherAddressContactPoint;
            $Teacher->save();

            $newStaff[] = $Teacher->ID;
            $amount--;
        }

        return $newStaff;
    }

    public static function createStudents($amount=5, $startYear=false, $numYears=4)
    {
        $addressContactPointClass = new Emergence\People\ContactPoint\Postal;
        $phoneContactPointClass = new Emergence\People\ContactPoint\Phone;
        $emailContactPointClass = new Emergence\People\ContactPoint\Email;
        
        $Groups = array();

        if (!$startYear) {
            $startYear = intval(date('Y'));
        }
        $endYear = $startYear + $numYears;

        if (!$SchoolGroup = Organization::getByHandle('demo_school')) {
            $SchoolGroup = Organization::create(array(
                'Name'    =>    'Demo School'
            ),true);
        }

        if (!$GuardianGroup = Group::getByHandle('guardians')) {
            $GuardianGroup = Group::create(array(
                'Name'    =>    'Guardians'
            ),true);
        }

        //Initialize Group Years
        for ($i=$startYear;$i<=$endYear;$i++) {
            if (!$Groups[$i] = Group::getByHandle('class_of_' . $i)) {
                $Groups[$i] = Group::create(array(
                    'Name'        =>    'Class of ' . $i
                    ,'ParentID'    =>    $SchoolGroup->ID
                ),true);
            }
        }

        $StudentsCount = DB::oneValue('SELECT COUNT(*) FROM `people` WHERE `Class`="Slate\\\Student"');

        $amount = $amount - $StudentsCount;
        $FirstNames = file(static::getFullUrl(self::FirstNameList));
        $newStudents = array();
        $LastNames = file(static::getFullUrl(self::LastNameList));
        $Streets = file(static::getFullUrl(self::StreetNameList));
        $staff = Emergence\People\Person::getAllByWhere(array('AccountLevel IN ("Staff", "Administrator")'));
        $Cities = file(static::getFullUrl(self::CitiesList));


        $StreetTypes = array('St','Dr','Ave','Pl');

        $RelationshipTypes = array('Mother','Father','Guardian','Foster Mother','Foster Father','Grandmother','Grandfather','Stepmother','Stepfather','Aunt','Uncle','Sister','Brother');
        $PhoneTypes = array('Home Phone', 'Mobile Phone', 'Work Phone');

        while ($amount > 0) {

            $FirstName = trim($FirstNames[array_rand($FirstNames)]);
            $LastName = trim($LastNames[array_rand($LastNames)]);
            $Advisor = $staff[array_rand($staff)];
            $cityData = explode(',',$Cities[array_rand($Cities)]);

            $password = static::createPassword();

            $StudentAddressData = array(
                'Postal' => str_pad(trim($cityData[0]), 5, 0, STR_PAD_LEFT)
                ,'State' => trim($cityData[2])
                ,'City' => ucwords(strtolower(trim($cityData[1])))
                ,'Number' => rand(1,3500)
                ,'Street' => trim($Streets[array_rand($Streets)]) . ' ' . $StreetTypes[array_rand($StreetTypes)]
            );

            // Create student
            $Student = Slate\People\Student::create(array(
                'FirstName'            => $FirstName
                ,'LastName'            => $LastName
                ,'Gender'            => rand(0,1)?'Male':'Female'
                ,'AccountLevel'        => 'Student'
                ,'StudentNumber'    => mt_rand()
                ,'GraduationYear'    => rand($startYear,$endYear)
                ,'Password'            => password_hash($password, PASSWORD_DEFAULT)
                ,'AdvisorID'        => $Advisor->ID
                ,'AssignedPassword' => $password
                ,'Username' => Emergence\People\User::getUniqueUsername($FirstName, $LastName)
            ),true);

            $GroupMembership = GroupMember::create(array(
                'GroupID'    =>    $Groups[$Student->GraduationYear]->ID
                ,'Role'        =>    'Member'
                ,'PersonID'    =>    $Student->ID
            ),true);

            $StudentEmail = $Student->Username . '@example.com';
            $StudentPhoneNumber = (rand(0,1)?'215':'267').'-'.rand(100,999).'-'.rand(1000,9999);

            $StudentEmailContactPoint = $emailContactPointClass::create(array(
                'PersonID'    =>    $Student->ID
                ,'Label' => 'School Email'
            ));
            $StudentEmailContactPoint->address = $StudentEmail;

            $StudentPhoneContactPoint = $phoneContactPointClass::create(array(
                'PersonID'    =>    $Student->ID
                ,'Label' =>  rand(0,1) ? 'Home Phone' : 'Mobile Phone'
            ));
            $StudentPhoneContactPoint->number = $StudentPhoneNumber;
            
            $StudentAddressContactPoint = $addressContactPointClass::create(array(
                'PersonID'    =>    $Student->ID
                ,'Label' => 'Home Address'
            ));         
            $StudentAddressContactPoint->number = $StudentAddressData['Number'];
            $StudentAddressContactPoint->street = $StudentAddressData['Street'];
            $StudentAddressContactPoint->city = $StudentAddressData['City'];
            $StudentAddressContactPoint->state = $StudentAddressData['State'];
            $StudentAddressContactPoint->postal = $StudentAddressData['Postal'];
            
            $Student->PrimaryEmail = $StudentEmailContactPoint;
            $Student->PrimaryPhone = $StudentPhoneContactPoint;
            $Student->PrimaryPostal = $StudentAddressContactPoint;
            $Student->save(true);

            $newStudents[] = $Student->ID;
            $r;

            if (rand(0,9))
            {
                $r = rand(2,3);
            }
            else
            {
                $Sibling = \Slate\People\Student::getByQuery('SELECT Student.*, (SELECT COUNT(*) FROM `%s` Relationship WHERE Relationship.PersonID=Student.ID AND Class="Guardian") AS GuardianCount, RAND() AS OrderNumber FROM `%s` Student HAVING Student.Class="Student" AND GuardianCount >= 2 ORDER BY OrderNumber LIMIT 1', array(
                    \Emergence\People\Relationship::$tableName
                    ,\Slate\People\Student::$tableName

                ));

                if($Sibling)
                {
                    $SiblingRelationship = \Emergence\People\Relationship::create(array(
                        'PersonID' => $Student->ID
                        ,'RelatedPersonID' => $Sibling->ID
                        ,'Label' => rand(0,1) ? 'Brother' : 'Sister'
                    ),true);

                    foreach($Sibling->GuardianRelationships as $SiblingGuardianRelationship)
                    {
                        $GRelationship = \Emergence\People\Relationship::create(array(
                            'PersonID'            =>    $Student->ID
                            ,'RelatedPersonID'    =>    $SiblingGuardianRelationship->RelatedPersonID
                            ,'Label'        =>  $SiblingGuardianRelationship->Relationship
                        ),true);
                    }

                    $r = 0;
                }
                else
                {
                    $r = rand(2,3);
                }

            }

            while ($r) {
                $names = [
                    'FirstName'            => $FirstNames[array_rand($FirstNames)]
                    ,'LastName'            => (rand(1,9)>3)?$Student->LastName:$LastNames[array_rand($LastNames)]
                ];
                
                // Create guardians
                while (Person::getByFullName($names['FirstName'], $names['LastName'])) {
                    $names['FirstName'] = $FirstNames[array_rand($FirstNames)];
                }
                
                $Guardian = Person::create($names,true);

                $GuardianEmail = $Guardian->FirstName . $Guardian->LastName . '@example.com';
                $GuardianPhoneNumber = (rand(0,1)?'215':'267').'-'.rand(100,999).'-'.rand(1000,9999);

                if(rand(0,9)<4) {
                    $parentCityData = explode(',',$Cities[array_rand($Cities)]);
                    $GuardianAddressData = array(
                        'Postal' => str_pad(trim($parentCityData[0]), 5, 0, STR_PAD_LEFT)
                        ,'State' => trim($parentCityData[2])
                        ,'City' => ucwords(strtolower(trim($parentCityData[1])))
                        ,'Address' => trim($Streets[array_rand($Streets)]) . ' ' . $StreetTypes[array_rand($StreetTypes)]
                        ,'Number' => rand(1,3500)
                    );

                    $GuardianAddress = $GuardianAddressData;
                }
                else {
                    $GuardianAddress = $StudentAddressData;
                }

                $GuardianEmailContactPoint = $emailContactPointClass::create(array(
                    'PersonID'    =>    $Guardian->ID
                    ,'Label' => rand(0,1)? 'Personal Email' : 'Work Email'
                ));
                $GuardianEmailContactPoint->loadString($GuardianEmail);
                
                $GuardianPhoneContactPoint = $phoneContactPointClass::create(array(
                    'PersonID'    =>    $Guardian->ID
                    ,'Label' => $PhoneTypes[array_rand($PhoneTypes)]
                ));
                $GuardianPhoneContactPoint->loadString($GuardianPhoneNumber);
                
                $GuardianAddressContactPoint = $addressContactPointClass::create(array(
                    'PersonID'    =>    $Guardian->ID
                    ,'Label' => rand(0,1)? 'Home Address' : 'Work Address'
                ));
                $GuardianAddressContactPoint->number = $GuardianAddressData['Number'];
                $GuardianAddressContactPoint->street = $GuardianAddressData['Address'];
                $GuardianAddressContactPoint->city = $GuardianAddressData['City'];
                $GuardianAddressContactPoint->state = $GuardianAddressData['State'];
                $GuardianAddressContactPoint->postal = $$GuardianAddressData['Postal'];
                

                $Guardian->PrimaryEmail = $GuardianEmailContactPoint;
                $Guardian->PrimaryPhone = $GuardianPhoneContactPoint;
                $Guardian->PrimaryAddress = $GuardianAddressContactPoint;
                $Guardian->save(true);

                // Setup relationship
                $GRelationship = \Emergence\People\GuardianRelationship::create(array(
                    'PersonID'            =>    $Student->ID
                    ,'RelatedPersonID'    =>    $Guardian->ID
                    ,'Label'        =>  (rand(1,9)>3)?(rand(0,1)?'Mother':'Father'):$RelationshipTypes[array_rand($RelationshipTypes)]
                ),true);

                $GuardianGroupMembership = GroupMember::create(array(
                    'GroupID'    =>    $GuardianGroup->ID
                    ,'Role'        =>    'Member'
                    ,'PersonID'    =>    $Guardian->ID
                ),true);

                $r--;
            }
            $amount--;
        }

        return $newStudents;
    }

    public static function createPassword($amount=7)
    {
        $chars = array(0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
        $password = '';
        for ($i=0;$i<$amount;$i++) {
            $char = $chars[rand(0, (count($chars)-1))];
            $password .= (!is_int($char) && rand(0,9) > 3) ? strtolower($char) : $char;
        }

        return $password;
    }

    public static function FillCourseSections($YearTerm)
    {
        $studentIDs = DB::allValues('ID','SELECT ID FROM `%s` WHERE `Class`="%s"', [
            Slate\People\Student::$tableName,
            \DB::escape(Slate\People\Student::class)
        ]);
        
        $Schedules = Slate\Courses\Schedule::getAll();
        $termIDs = $YearTerm->getContainedTermIDs();
        
        foreach ($Schedules as $Schedule) {
            $Sections = Slate\Courses\Section::getAllByWhere(array(
                'ScheduleID' => $Schedule->ID
                ,'TermID IN('.implode(',',$termIDs).')'
            ));

            foreach ($Sections as $Section) {
                $Capacity = intval($Section->StudentsCapacity);

                $CourseSectionParticipants = Slate\Courses\SectionParticipant::getAllByField('CourseSectionID',$Section->ID);

                $Filler = $Capacity - count($CourseSectionParticipants);

                if ($Filler) {
                    $RandStudentIDs = array_filter(array_rand($studentIDs,$Filler));

                    if (is_array($RandStudentIDs) && count($RandStudentIDs)) {
                        foreach($RandStudentIDs as $RandStudentID) {
                            $CourseSectionParticipant = Slate\Courses\SectionParticipant::create([
                                'CourseSectionID' => $Section->ID,
                                'PersonID' => $studentIDs[$RandStudentID],
                                'Role' => 'Student'
                            ],true);
                        }
                    }
                    
                }
            }
        }
    }
}