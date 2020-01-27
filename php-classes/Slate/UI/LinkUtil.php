<?php

namespace Slate\UI;

use ActiveRecord;
use Tag;
use UserUnauthorizedException;

class LinkUtil
{
    protected static function sortLinks($a, $b)
    {
        if ($a['weight'] == $b['weight']) {
            return strnatcmp($a['label'], $b['label']);
        }

        return $a['weight'] < $b['weight'] ? -1 : 1;
    }

    public static function mergeSources($sources, $context = null)
    {
        $links = [];

        foreach ($sources AS $source) {
            if (is_string($source) && is_subclass_of($source, ILinksSource::class)) {
                $newLinks = $source::getLinks($context);
            } elseif (is_callable($source)) {
                $newLinks = call_user_func($source, $context);
            } elseif ($source instanceof ActiveRecord) {
                $newLinks = [$source];
            } elseif (is_array($source) || $source instanceof \Traversable || $source instanceof \stdClass) {
                $newLinks = $source;
            } else {
                continue;
            }

            $links = LinkUtil::mergeTree($links, LinkUtil::normalizeTree($newLinks, $context));
        }

        uasort($links, [static::class, 'sortLinks']);

        return $links;
    }

    public static function normalizeTree($inputTree, $context = null)
    {
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
            } elseif ($value instanceof Tag) {
                $value = [
                    '_tag' => $value
                ];
            } elseif ($value instanceof ActiveRecord) {
                $value = [
                    '_record' => $value
                ];
            } elseif (!is_array($value)) {
                throw new \UnexpectedValueException('Link tree value must be array, string, or ActiveRecord instance');
            }


            // apply dynamically-derived attributes
            if (!empty($value['_tag'])) {
                $children = [];

                foreach ($value['_tag']->getReadableItems() AS $TagItem) {
                    $children[$TagItem->Context->getHandle()] = [
                        '_href' => $TagItem->Context->getUrl(),
                        '_label' => $TagItem->Context->getTitle()
                    ];
                }

                if (empty($value['_label'])) {
                    $value['_label'] = is_string($key) ? $key : $value['_tag']->getTitle();
                }

                if (empty($value['_href'])) {
                    $value['_href'] = $value['_tag']->getUrl();
                }

                if (count($children)) {
                    $value['_children'] = !empty($value['_children']) ? array_merge($value['_children'], $children) : $children;
                }
            }

            if (!empty($value['_record'])) {
                if (empty($value['_label'])) {
                    $value['_label'] = is_string($key) ? $key : $value['_record']->getTitle();
                }

                if (empty($value['_href'])) {
                    $value['_href'] = $value['_record']->getUrl();
                }

                if (empty($value['_iconSrc'])) {
                    $value['_iconSrc'] = $context && property_exists($context, 'preferredIconSize') && $context::$preferredIconSize ? $value['_record']->getThumbnailURL($context::$preferredIconSize) : null;
                }
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
                $link['children'] = static::normalizeTree($children, $context);
                uasort($link['children'], [static::class, 'sortLinks']);
            }

            // apply weight
            if (empty($link['weight'])) {
                $link['weight'] = 0;
            } else {
                $link['weight'] = (int)$link['weight'];
            }

            // choose output key for link
            if (isset($link['id'])) {
                $key = $link['id'];
            } elseif (!is_string($key)) {
                $key = $link['label'];
            }


            // add to output if there is any content
            if (!empty($link['href']) || !empty($link['children'])) {
                $outputTree[$key] = $link;
            }
        }

        return $outputTree;
    }

    public static function mergeTree($existingTree, $inputTree)
    {
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

        return $existingTree;
    }
}