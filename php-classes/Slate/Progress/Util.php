<?php

namespace Slate\Progress;


class Util
{
    public static function chunkReportsByType(array $reports)
    {
        $chunks = [];
        $currentChunk = null;

        foreach ($reports AS $Report) {
            if ($currentChunk && $currentChunk['class'] == $Report->Class) {
                $currentChunk['reports'][] = $Report;

                $timestamp = $Report->getTimestamp();

                if ($currentChunk['timestampMin'] > $timestamp) {
                    $currentChunk['timestampMin'] = $timestamp;
                }

                if ($currentChunk['timestampMax'] < $timestamp) {
                    $currentChunk['timestampMax'] = $timestamp;
                }

                continue;
            }

            if ($currentChunk) {
                $chunks[] = $currentChunk;
            }

            $currentChunk = [
                'class' => $Report->Class,
                'timestampMin' => $Report->getTimestamp(),
                'timestampMax' => $Report->getTimestamp(),
                'reports' => [$Report]
            ];
        }

        if ($currentChunk) {
            $chunks[] = $currentChunk;
        }

        foreach ($chunks AS &$chunk) {
            $chunk['singularNoun'] = $chunk['class']::getNoun(1);
            $chunk['pluralNoun'] = $chunk['class']::getNoun(2);
            $chunk['noun'] = $chunk['class']::getNoun(count($chunk['reports']));
        }

        return $chunks;
    }

    public static function groupReportsByStudent(array $reports)
    {
        $groups = [];

        foreach ($reports AS $Report) {
            $Student = $Report->getStudent();

            if (isset($groups[$Student->ID])) {
                $groups[$Student->ID]['reports'][] = $Report;
            } else {
                $groups[$Student->ID] = [
                    'student' => $Student,
                    'reports' => [$Report]
                ];
            }
        }

        // sort by Last, First
        usort($groups, function($g1, $g2) {
            return strcasecmp($g1['student']->LastName.$g1['student']->FirstName, $g2['student']->LastName.$g2['student']->FirstName);
        });

        return $groups;
    }

    public static function groupReportsByTerm(array $reports)
    {
        $groups = [];

        foreach ($reports AS $Report) {
            $Term = $Report->getTerm();

            if (isset($groups[$Term->Handle])) {
                $groups[$Term->Handle]['reports'][] = $Report;
            } else {
                $groups[$Term->Handle] = [
                    'term' => $Term,
                    'reports' => [$Report]
                ];
            }
        }

        // sort by term position
        usort($groups, function($g1, $g2) {
            return $g2['term']->Left - $g1['term']->Left;
        });

        return $groups;
    }
}