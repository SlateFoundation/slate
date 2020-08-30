<?php

namespace Slate\UI\Adapters;

use Slate\Courses\Department;
use Slate\Courses\Course;
use Slate\Courses\Section;

class Courses implements \Slate\UI\ILinksSource
{
    public static $enabled = true;
    public static $weight = -1000;

    public static $courseIcons = [
        'arithmetic' => [
            'courseCodes' => ['ALG', 'CALC', 'MATH', 'PRECALC', 'STAT']
        ],
        'writing' => [
            'courseCodes' => ['ENG', 'ELA', 'PHILO', 'JOURNAL', 'SS']
        ],
        'chemistry' => [
            'courseCodes' => ['BIO', 'CHEM', 'ADVCHEM', 'BC', 'ENVSCI', 'PHYS']
        ],
        'globe' => [
            'courseCodes' => ['HIS', 'HIST', 'GEO', 'AMHIST', 'WRLDHIST']
        ],
        'palette' => [
            'courseCodes' => ['ART', 'CRAFTS', 'DRAMA', 'MUSIC', 'SRART']
        ],
        'binoculars' => [
        ],
        'heartbeat' => [
            'courseCodes' => ['HEALTH', 'PE', 'ANAT']
        ],
        'intl' => [
            'courseCodes' => ['SP', 'FR', 'GR', 'SASTUDIES']
        ],
        'graduate' => [
            'courseCodes' => ['ILP', 'ADV', 'CAP', 'ISP', 'SAT']
        ],
        'users' => [
            'courseCodes' => ['INTERSECT', 'AFAM', 'AMGOV']
        ],
        'network' => [
            'courseCodes' => ['PODCAST', 'DIGFILM', 'ADVCSE', 'CSE', 'CTEENG', 'ENGIN', 'TECH']
        ],
        'chat' => [
            'courseCodes' => ['DEB']
        ]
    ];

    public static function getIcon(\ActiveRecord $Record)
    {
        if ($Record->isA(Department::class)) {
            $Department = $Record;
        } elseif ($Record->isA(Course::class)) {
            $Course = $Record;
            $Department = $Course->Department;
        } elseif ($Record->isA(Section::class)) {
            $Section = $Record;
            $Course = $Section->Course;
            $Department = $Course->Department;
        }

        // look for course code match first
        if (isset($Course)) {
            foreach (static::$courseIcons AS $iconKey => $iconCfg) {
                if (
                    $Course->Code &&
                    !empty($iconCfg['courseCodes']) &&
                    is_array($iconCfg['courseCodes']) &&
                    in_array(strtoupper($Course->Code), $iconCfg['courseCodes'])
                ) {
                    return $iconKey;
                }
            }
        }

        // TODO: look for a department match

        return null;
    }

    public static function getLinks($context = null)
    {
        if (!static::$enabled || empty($_SESSION['User'])) {
            return [];
        }

        $weight = static::$weight;

        $linkGroups = [
            'Courses' => [
                '_icon' => 'diploma',
                '_href' => Section::$collectionRoute.'?'.http_build_query([ 'term' => '*current' ]),
                '_weight' => $weight++,
                '_children' => array_map(function(Section $Section) {
                    return [
                        '_id' => $Section->Code,
                        '_label' => $Section->getTitle(),
                        '_shortLabel' => $Section->Code,
                        '_icon' => static::getIcon($Section),
                        '_href' => $Section->getUrl()
                    ];
                }, $_SESSION['User']->CurrentCourseSections)
            ]
        ];

        if (!empty($_SESSION['User']->Wards)) {
            foreach ($_SESSION['User']->Wards as $Ward) {
                if (empty($Ward->CurrentCourseSections) || !$Ward->Username) {
                    continue;
                }

                $linkGroups[$Ward->Username] = [
                    '_icon' => 'diploma',
                    '_href' => Section::$collectionRoute.'?'.http_build_query([ 'term' => '*current', 'enrolled_user' => $Ward->Username ]),
                    '_label' => $Ward->FirstNamePossessive . ' Courses',
                    '_weight' => $weight++,
                    '_children' => array_map(function(Section $Section) {
                        return [
                            '_id' => $Section->Code,
                            '_label' => $Section->getTitle(),
                            '_shortLabel' => $Section->Code,
                            '_icon' => static::getIcon($Section),
                            '_href' => $Section->getUrl()
                        ];
                    }, $Ward->CurrentCourseSections)
                ];
            }
        }

        return $linkGroups;
    }
}
