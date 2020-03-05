<?php

return [
    'title' => 'Repair collections tree',
    'description' => 'Repairs and cleans collections tree by removing entries that have never had files, remapping left/right nested set fields, and clearing efs data from the site cache',
    'warning' => 'This operation could render the site unresponsive if executed during high load',
    'icon' => 'wrench',
    'requireAccountLevel' => 'Developer',
    'handler' => function () {
        if ('POST' == $_SERVER['REQUEST_METHOD']) {
            set_time_limit(0);

            $ops = !empty($_POST['ops']) && is_array($_POST['ops']) ? $_POST['ops'] : [];
            $messages = [];

            if (in_array('erase-unused', $ops)) {
                // get IDs of collections with no descendent files
                $emptyCollectionIds = DB::allValues(
                    'ID',
                    '  SELECT c1.ID'
                    .'   FROM _e_file_collections c1'
                    .'   JOIN _e_file_collections c2 ON c2.PosLeft BETWEEN c1.PosLeft AND c1.PosRight'
                    .'   JOIN (SELECT c.ID, COUNT(f.ID) AS TotalFiles FROM _e_file_collections c LEFT JOIN _e_files f ON f.CollectionID = c.ID GROUP BY c.ID) _col_files ON _col_files.ID = c2.ID'
                    .'  GROUP BY c1.ID'
                    .' HAVING SUM(_col_files.TotalFiles) = 0'
                );

                // delete empty collections
                if (count($emptyCollectionIds)) {
                    DB::nonQuery('DELETE FROM _e_file_collections WHERE ID IN (%s)', implode(',', $emptyCollectionIds));
                    $erasedCollections = DB::affectedRows();
                } else {
                    $erasedCollections = 0;
                }

                $messages[] = "Erased $erasedCollections unused collections";
            }

            if (in_array('erase-orphans', $ops)) {
                // delete orphan collections
                DB::nonQuery('DELETE c3 FROM (SELECT c1.* FROM _e_file_collections c1 LEFT JOIN _e_file_collections c2 ON c2.ID = c1.ParentID WHERE c1.ParentID IS NOT NULL AND c2.ID IS NULL) orphan JOIN _e_file_collections c3 ON (c3.PosLeft BETWEEN orphan.PosLeft AND orphan.PosRight)');
                $erasedCollections = DB::affectedRows();

                // delete orphan files
                DB::nonQuery('DELETE f FROM _e_files f LEFT JOIN _e_file_collections c ON c.ID = f.CollectionID WHERE c.ID IS NULL');
                $erasedFiles = DB::affectedRows();

                $messages[] = "Erased $erasedCollections orphaned collections and $erasedFiles orphaned files";
            }

            if (in_array('merge-ghost-collections', $ops)) {
                // find live collections that have a deleted collection at the same layer+parent+handle
                $duplicates = DB::allRecords(
                    'SELECT c1.ID AS current,
                            c2.ID AS deleted
                       FROM _e_file_collections c1
                       JOIN _e_file_collections c2
                         ON c1.Site = c2.Site
                            AND c1.ParentID = c2.ParentID
                            AND c1.Handle = c2.Handle
                            AND c1.Status = "Normal"
                            AND c2.Status = "Deleted"
                    '
                );

                $messages[] = sprintf('Found %u ghost collections', count($duplicates));

                // merge all collections and files into the not deleted collection and erase the deleted collection
                foreach ($duplicates as $duplicate) {
                    DB::nonQuery('UPDATE _e_files SET CollectionID = %u WHERE CollectionID = %u', [$duplicate['current'], $duplicate['deleted']]);
                    $movedFiles = DB::affectedRows();

                    DB::nonQuery('UPDATE _e_file_collections SET ParentID = %u WHERE ParentID = %u', [$duplicate['current'], $duplicate['deleted']]);
                    $movedCollections = DB::affectedRows();

                    DB::nonQuery('DELETE FROM _e_file_collections WHERE ID = %u', $duplicate['deleted']);

                    $messages[] = "Merged $movedFiles files and $movedCollections collections out of ghost collection";
                }
            }

            if (in_array('renest', $ops)) {
                // renest all collections
                $renestedCount = NestingBehavior::repairTable(SiteCollection::class, 'PosLeft', 'PosRight');

                $messages[] = "Renested $renestedCount collections";
            }

            if (in_array('clear-cache', $ops)) {
                // clear EFS cache
                $keysDeleted = Cache::deleteByPattern('/^efs:/');

                $messages[] = "Cleared $keysDeleted cache entries";
            }

            return static::respond('message', [
                'title' => 'Filesystem repaired',
                'message' => count($messages) ? ' - '.implode("\n - ", $messages) : 'No operations performed',
            ]);
        }

        return static::respond('repair');
    },
];
