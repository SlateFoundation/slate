<?php

class NestingBehavior extends RecordBehavior
{
    public static function onSave($Record)
    {
        // if parent record is dirty or phantom, it must be saved first
        if ($Record->Parent && $Record->Parent->isDirty) {
            $Record->Parent->save();
        }

        // set Left & Right nesting positions
        if (!$Record->Left && !$Record->Right) {
            if ($Record->Parent) {
                // insert at right edge of parent
                $Record->Left = $Record->Parent->Right;
                $Record->Right = $Record->Left + 1;

                // push rest of set right by 2
                DB::nonQuery('LOCK TABLE `%s` WRITE', $Record::$tableName);

                DB::nonQuery(
                    'UPDATE `%s` SET `Right` = `Right` + 2 WHERE `Right` >= %u ORDER BY `Right` DESC'
                    ,array(
                        $Record::$tableName
                        ,$Record->Left
                    )
                );
                DB::nonQuery(
                    'UPDATE `%s` SET `Left` = `Left` + 2 WHERE `Left` > %u ORDER BY `Left` DESC'
                    ,array(
                        $Record::$tableName
                        ,$Record->Left
                    )
                );

                DB::nonQuery('UNLOCK TABLES');

                // update cached parent position if its already dirty, else just clear it
                if ($Record->Parent->isDirty) {
                    $Record->Parent->Right += 2;
                } else {
                    $Record->clearRelatedObject('Parent');
                }
            } else {
                try {
                    // append to end of set
                    $Record->Left = 1 + DB::oneValue('SELECT MAX(`Right`) FROM `%s`', $Record::$tableName);
                } catch (TableNotFoundException $e) {
                    // first node in tree
                    $Record->Left = 1;
                }

                $Record->Right = 1 + $Record->Left;
            }
        } elseif ($Record->isFieldDirty('ParentID')) {
            // TODO: adjust nesting
            // also, this doesn't detect if relationship is dirty
        }
    }

    public static function onDestroy($Record)
    {
        $className = get_class($Record);
        $left = $Record->Left;
        $right = $Record->Right;
        $width = $right - $left + 1;

        DB::nonQuery(
            'DELETE FROM `%s` WHERE `Left` BETWEEN %u AND %u;'
            ,array(
                $className::$tableName
                ,$left
                ,$right
            )
        );

        DB::nonQuery(
            'UPDATE `%s` SET `Right` = `Right` - %u WHERE `Right` > %u;'
            ,array(
                $className::$tableName
                ,$width
                ,$right
            )
        );

        DB::nonQuery(
            'UPDATE `%s` SET `Left` = `Left` - %u WHERE `Left` > %u'
            ,array(
                $className::$tableName
                ,$width
                ,$right
            )
        );
    }


    public static function repairTable($className, $leftCol = 'Left', $rightCol = 'Right', $parentCol = 'ParentID')
    {
        $tableName = $className::$tableName;

        // check for orphan collections first
        if ($tableName == '_e_file_collections') {
            $orphanCollections = DB::allValues('ID', 'SELECT c1.ID FROM _e_file_collections c1 LEFT JOIN _e_file_collections c2 ON c2.ID = c1.ParentID WHERE c1.ParentID IS NOT NULL AND c2.ID IS NULL');

            if (count($orphanCollections)) {
                throw new Exception('Cannot renest table, orphan collections found: '.implode(',', $orphanCollections));
            }
        }

        // compile map
        $records = array();
        $backlog = array();
        $cursor = 1;

        $result = DB::query(
            'SELECT ID, `%2$s` FROM `%1$s` ORDER BY `%2$s`, %3$s'
            ,array(
                $tableName
                ,$parentCol
                ,!empty($className::$siblingOrder) ? $className::$siblingOrder : 'ID'
            )
        );

        while (($record = $result->fetch_assoc()) || ($record = array_shift($backlog))) {
            if ($record[$parentCol]) {
                if (!$parent = &$records[$record[$parentCol]]) {
                    // if parent not found yet, save to end of backlog and skip this record
                    $backlog[] = $record;
                    continue;
                }

                $record[$leftCol] = $parent[$rightCol];
                $record[$rightCol] = $record[$leftCol] + 1;

                foreach ($records AS &$bAccount) {
                    if ($bAccount[$leftCol] > $record[$leftCol]) {
                        $bAccount[$leftCol] += 2;
                    }

                    if ($bAccount[$rightCol] >= $record[$leftCol]) {
                        $bAccount[$rightCol] += 2;
                    }
                }

                $cursor += 2;
            } else {
                $record[$leftCol] = $cursor++;
                $record[$rightCol] = $cursor++;
            }

            $records[$record['ID']] = $record;
        }

        // write results
        DB::nonQuery(
            'UPDATE `%s` SET `%s` = NULL, `%s` = NULL'
            ,array(
                $tableName
                ,$leftCol
                ,$rightCol
            )
        );

        foreach ($records AS $record) {
            DB::nonQuery(
                'UPDATE `%s` SET `%s` = %u, `%s` = %u WHERE ID = %u'
                , array(
                    $tableName
                    ,$leftCol
                    ,$record[$leftCol]
                    ,$rightCol
                    ,$record[$rightCol]
                    ,$record['ID']
                )
            );
        }

        return count($records);
    }
}