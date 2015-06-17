<?php

namespace Slate\UI;

class LinkUtil
{
	public static function normalizeTree($inputTree)
	{
		if (!empty($_GET['debug'])) \Debug::dumpVar($inputTree, false, 'normalizeTree input');

		$outputTree = [];

		foreach ($inputTree AS $key => $value) {
			if (!$value) {
				continue;
			}

			// convert value to attributes array if needed
			if (is_string($value)) {
				$value = [
					'_href' => $value
				];
			} elseif ($value instanceof \ActiveRecord) {
				$value = [
					'_label' => $value->getTitle(),
					'_href' => $value->getUrl()
				];
			} elseif (!is_array($value)) {
				throw new \UnexpectedValueException('Link tree value must be array, string, or ActiveRecord instance');
			}

			// each item in array is either an attribute for this link or a sublink
			$link = [];
			$children = [];

			foreach ($value AS $subKey => $subValue) {
				if (!$subValue) {
					continue; // skip falsey values
				}

				if (!is_string($subKey)) {
					$children[] = $subValue;
				} elseif ($subKey == '_children') {
					$children = array_merge($children, $subValue);
				} elseif ($subKey[0] != '_') {
					$children[$subKey] = $subValue;
				} else {
					$link[substr($subKey, 1)] = $subValue;
				}
			}

			// default label to array key if it's a string
			if (!isset($link['label'])) {
				if (is_string($key)) {
					$link['label'] = $key;
				} else {
					throw new \UnexpectedValueException('Link must have a string key or label attribute');
				}
			}

			// copy normalized children to link
			if (count($children)) {
				$link['children'] = static::normalizeTree($children);
			}

			$outputTree[$link['label']] = $link;
		}

		if (!empty($_GET['debug'])) \Debug::dumpVar($outputTree, false, 'normalizeTree result');

		return $outputTree;
	}

	public static function mergeTree($existingTree, $inputTree)
	{
		if (!empty($_GET['debug'])) \Debug::dumpVar(['$existingTree' => $existingTree, '$inputTree' => $inputTree], false, 'mergeTree input');

		foreach ($inputTree AS $key => $value) {
			if (
				is_string($key) &&
				is_array($value) &&
				!empty($existingTree[$key]) &&
				is_array($existingTree[$key])
			) {
				$existingTree[$key] = static::mergeTree($existingTree[$key], $value);
			} else {
				if (is_string($key)) {
					$existingTree[$key] = $value;
				} else {
					$existingTree[] = $value;
				}
			}
		}

		if (!empty($_GET['debug'])) \Debug::dumpVar($existingTree, false, 'mergeTree result');

		return $existingTree;
	}
}