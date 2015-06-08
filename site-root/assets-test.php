<?php

$GLOBALS['Session']->requireAccountLevel('Developer');

$Asset = Slate\Assets\Asset::getByID(1);
#MICS::dump($Asset->getStackedConfig('fields'), 'name stacked config', true);
$Asset->AssigneeID = rand(1, 4);
$Asset->save();
#JSON::translateAndRespond($Asset->getDetails($_REQUEST['include'] ?: '*'));
#$Asset->Name = "test" . rand(1, 40);
#$Asset->LocationID = rand(1,20);
#$Asset->StatusID = rand(1,20);
#$Asset->save(true);
#
#$Aliases = $Asset->Aliases;
#MICS::dump($Aliases, 'aliases');
#$Aliases[0]->Identifier = str_replace("TEST", "", $Aliases[0]->Identifier);
#
#$Aliases[0]->save(false);
#
#$_POST['Note'] = $_GET['Note'];//; aarray_merge($_POST, $_GET);
#
#$Activity = CommentActivity::publish($Asset, 'comment', $GLOBALS['Session']->Person, "TESTING COMMENT ACTIVITY");
#
#MICS::dump($Activity, 'activity', true);
#Slate\Assets\AssetsRequestHandler::handleRecordRequest($Asset);

#DB::nonQuery('UPDATE `%s` SET Class = "%s" WHERE Class = "Activity"', array( Activity::$tableName, "CommentActivity"));
#$dActivity = DeltaActivity::getByWhere(array(1), array('order' => 'ID ASC'));
#MICS::dump($dActivity->getChanges(), 'changes', true);