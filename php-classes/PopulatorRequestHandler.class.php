<?php

class PopulatorRequestHandler extends RequestHandler
{
    public static $userResponseModes = array(
        'application/json' => 'json'
    );

    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAuthentication();

        if ($_SERVER['REQUEST_METHOD'] == "POST") {
            set_time_limit(0);

            $demoInfo = array(
                'numStudents' => 500
                ,'startYear' => 2014
                ,'numYears' => 4
                ,'numTeachers' => 25
                ,'numStaff' => 3
                ,'numAdministrators' => 3
                ,'numCourseSections' => 50
                ,'minSectionParticipants' => 25
                ,'maxSectionParticipants' => 50
                ,'interimsPerStudent' => 2
                ,'narrativesPerStudent' => 2
                ,'progressNotesPerStudent' => 2
                ,'blogsPerStudent' => 2
                ,'worksheetPerClass' => 2
                ,'gradedStudentsPerWorksheet' => 2
                ,'createAssets' => false
            );

            $demoInfo = array_merge($demoInfo, array_filter($_POST));

            $response = Populate::People(array(
                'numStudents' => $demoInfo['numStudents']
                ,'startYear' => $demoInfo['startYear']
                ,'numYears' => $demoInfo['numYears']
            ), $demoInfo['numTeachers'], $demoInfo['numStaff'], $demoInfo['numAdministrators']);

            foreach ($response AS $type => $items) {
                print count($items) . " new $type created.<br>";
            }

            $courseResponse = Populate::createCourses($demoInfo['numCourseSections'], $demoInfo['minSectionParticipants'], $demoInfo['maxSectionParticipants'], $demoInfo['startYear']);

            foreach ($courseResponse['new'] AS $type => $items) {
                print count($items) . " new $type created.<br>";
            }

            foreach ($courseResponse AS $type => $items) {
                if ($type == 'new') {
                    continue;
                } else {
                    print count($items) . " $type already found.<br>";
                }
            }


            $Term = $courseResponse['terms']['Year Term'];

            Populate::FillCourseSections($Term);

/*
            Populate::createInterims($Term, $demoInfo['interimsPerStudent']);

            Populate::createNarratives($Term, $demoInfo['narrativesPerStudent']);

            Populate::createStandards($Term, $demoInfo['worksheetPerClass'], $demoInfo['gradedStudentsPerWorksheet']);

            Populate::createProgressNotes($Term, $demoInfo['progressNotesPerStudent']);

#            if($demoInfo['createAssets'])
#            {
#                Populate::createAssets();
#            }

            Populate::fillCMSContent($Term, $demoInfo['blogsPerStudent']);
*/

            print 'Data successfully generated.<hr>';
        }

        static::respond('populate');
    }
}