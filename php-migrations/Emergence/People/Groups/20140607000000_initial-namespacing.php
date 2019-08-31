<?php

$skipped = true;
$newGroupClassType = 'enum(\'Emergence\\\\People\\\\Groups\\\\Group\',\'Emergence\\\\People\\\\Groups\\\\Organization\')';
$newGroupMemberClassType = 'enum(\'Emergence\\\\People\\\\Groups\\\\GroupMember\')';


// migration
if (static::tableExists('groups') && static::getColumnType('groups', 'Class') != $newGroupClassType) {
    print("Updating `Class` enum for `groups`\n");
    DB::nonQuery('ALTER TABLE `groups` CHANGE `Class` `Class` ENUM("Group","Organization","Emergence\\\\People\\\\Groups\\\\Group","Emergence\\\\People\\\\Groups\\\\Organization") NOT NULL');
    DB::nonQuery('UPDATE `groups` SET `Class` = "Emergence\\\\People\\\\Groups\\\\Group" WHERE `Class` = "Group"');
    DB::nonQuery('UPDATE `groups` SET `Class` = "Emergence\\\\People\\\\Groups\\\\Organization" WHERE `Class` = "Organization"');
    DB::nonQuery('ALTER TABLE `groups` CHANGE `Class` `Class` '.$newGroupClassType.' NOT NULL');
    $skipped = false;
}

if (static::tableExists('group_members') && static::getColumnType('group_members', 'Class') != $newGroupMemberClassType) {
    print("Updating `Class` enum for `group_members`\n");
    DB::nonQuery('ALTER TABLE `group_members` CHANGE `Class` `Class` '.$newGroupMemberClassType.' NOT NULL');
    DB::nonQuery('UPDATE `group_members` SET `Class` = "Emergence\\\\People\\\\Groups\\\\GroupMember"');
    $skipped = false;
}


// done
return $skipped ? static::STATUS_SKIPPED : static::STATUS_EXECUTED;