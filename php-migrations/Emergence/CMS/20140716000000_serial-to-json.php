<?php

if (
    DB::oneRecord('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "content"') &&
    DB::oneRecord('SELECT 1 FROM `content` WHERE LayoutConfig REGEXP "^[sa]:[0-9]+:" OR LayoutConfig = "N;" LIMIT 1')
) {
    print("Converting serialized data to json data in content table...\n");
    $result = DB::query('SELECT ID, LayoutConfig FROM `content`');
    while ($record = $result->fetch_assoc()) {
        DB::nonQuery('UPDATE `content` SET LayoutConfig = "%s" WHERE ID = %u', [
            DB::escape(json_encode($record['LayoutConfig'] ? unserialize($record['LayoutConfig']) : null))
            ,$record['ID']
        ]);
    }

    print("Converting serialized data to json data in history_content table...\n");
    $result = DB::query('SELECT RevisionID, LayoutConfig FROM `history_content`');
    while ($record = $result->fetch_assoc()) {
        DB::nonQuery('UPDATE `history_content` SET LayoutConfig = "%s" WHERE RevisionID = %u', [
            DB::escape(json_encode($record['LayoutConfig'] ? unserialize($record['LayoutConfig']) : null))
            ,$record['RevisionID']
        ]);
    }
}


if (
    DB::oneRecord('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = SCHEMA() AND TABLE_NAME = "content_items"') &&
    DB::oneRecord('SELECT 1 FROM `content_items` WHERE Data REGEXP "^[sa]:[0-9]+:" OR Data = "N;" LIMIT 1')
) {
    print("Converting serialized data to json data in content_items table...\n");
    $result = DB::query('SELECT ID, Data FROM `content_items`');
    while ($record = $result->fetch_assoc()) {
        DB::nonQuery('UPDATE `content_items` SET Data = "%s" WHERE ID = %u', [
            DB::escape(json_encode($record['Data'] ? unserialize($record['Data']) : null))
            ,$record['ID']
        ]);
    }

    print("Converting serialized data to json data in history_content_items table...\n");
    $result = DB::query('SELECT RevisionID, Data FROM `history_content_items`');
    while ($record = $result->fetch_assoc()) {
        DB::nonQuery('UPDATE `history_content_items` SET Data = "%s" WHERE RevisionID = %u', [
            DB::escape(json_encode($record['Data'] ? unserialize($record['Data']) : null))
            ,$record['RevisionID']
        ]);
    }
}

return static::STATUS_EXECUTED;