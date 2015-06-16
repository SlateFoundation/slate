<?php

namespace Slate\UI;

class Omnibar
{
	public static $sources = [
		Courses::class,
		Tools::class,
		User::class
	];

	public static $preferredIconSize = 48;

	public static function getItems()
	{
		$items = [];

		foreach (static::$sources AS $source) {
			if (is_subclass_of($source, IOmnibarSource::class)) {
				$newItems = $source::getOmnibarItems();
			} elseif (is_callable($source)) {
				$newItems = call_user_func($source);
			} elseif (is_array($source) || $source instanceof Traversable || $source instanceof stdClass) {
				$newItems = $source;
			} else {
				continue;
			}

			$items = static::mergeItems($items, $newItems);
		}

		return static::parseItems($items);
	}

	public static function mergeItems(array $existingItems, array $newItems)
	{
		foreach ($newItems AS $key => $value) {
			if (
				is_array($value) &&
				!empty($existingItems[$key]) &&
				is_array($existingItems[$key])
			) {
				if (is_string($key)) {
					$existingItemss[$key] = static::mergeItems($existingItems, $value);
				} else {
					$existingItemss[] = static::mergeItems($existingItems, $value);
				}
			} else {
				if (is_string($key)) {
					$existingItems[$key] = $value;
				} else {
					$existingItems[] = $value;
				}
			}
		}

		return $existingItems;
	}

	public static function parseItems(array $inputItems)
	{
		$outputItems = [];

		foreach ($inputItems AS $key => $value) {
			if (!$value) {
				continue;
			}

			$outputItem = [];
			
			if (is_string($value)) {
				$value = [
					'_href' => $value
				];
			} elseif ($value instanceof \ActiveRecord) {
				$value = [
					'_label' => $value->getTitle(),
					'_href' => $value->getUrl()
				];
			}

			if (!empty($value['_label'])) {
				$outputItem['label'] = $value['_label'];
			} elseif (is_string($key)) {
				$outputItem['label'] = $key;
			}

			if (!empty($value['_shortLabel'])) {
				$outputItem['shortLabel'] = $value['_shortLabel'];
			}

			if (!empty($value['_href'])) {
				$outputItem['href'] = $value['_href'];
			}

			if (!empty($value['_iconSrc'])) {
				$outputItem['iconSrc'] = $value['_iconSrc'];
			}

			if (!empty($value['_icon'])) {
				$outputItem['icon'] = $value['_icon'];
			}

			if (isset($value['_items']) && is_array($value['_items'])) {
				$outputItem['items'] = $value['_items'];
			} elseif(is_array($value)) {
				$extractedItems = [];
				foreach ($value AS $subKey => $subValue) {
					if (!is_string($subKey) || $subKey[0] != '_') {
						$extractedItems[$subKey] = $subValue;
					}
				}
				
				if (count($extractedItems)) {
					$outputItem['items'] = $extractedItems;
				}
			}

			if (isset($outputItem['items'])) {
				$outputItem['items'] = static::parseItems($outputItem['items']);
			}

			$outputItems[] = $outputItem;
		}

		return $outputItems;
	}
}