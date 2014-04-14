<?php

$GLOBALS['Session']->requireAccountLevel('Developer');
$Me = $GLOBALS['Session']->Person;

#$Relationship = Emergence\People\Relationship::getByID(1);
#
#Debug::dump($Relationship->getDetails(array('InverseRelationship')), false);
#Debug::dump(Debug::$log);

#$Me->PrimaryPostal = \Emergence\People\ContactPoint\Postal::fromString('916 New Market St, Apt B, Philadelphia, PA 19123');
#$Me->save();

#MICS::dump($Me->PrimaryEmail, '$Me->PrimaryEmail');
#MICS::dump($Me->Email, '$Me->Email');
#
#$Me->Email = 'chris@jarv.us';
#
#MICS::dump($Me->PrimaryEmail, '$Me->PrimaryEmail');
#MICS::dump($Me->Email, '$Me->Email');
#MICS::dump($Me, '$Me');
#
#
#
#MICS::dump(Debug::$log);