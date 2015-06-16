<?php

namespace Slate\UI;

use Slate\Courses\Department;
use Slate\Courses\Course;
use Slate\Courses\Section;

class Courses
{
	public static $courseIcons = [
		'arithmetic' => [
			'courseCodes' => ['ALG']
		],
		'writing' => [
			'courseCodes' => ['ENG']
		],
		'chemistry' => [
			'courseCodes' => ['BIO', 'CHEM']
		],
		'globe' => [
			'courseCodes' => ['HIS', 'HIST', 'GEO']
		],
		'palette' => [
			'courseCodes' => ['ART']
		],
		'binoculars' => [
		],
		'heartbeat' => [
			'courseCodes' => ['HEALTH']
		],
		'intl' => [
			'courseCodes' => ['SP']
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
}