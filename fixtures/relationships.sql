/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `relationships` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\People\\Relationship','Emergence\\People\\GuardianRelationship') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `PersonID` int(10) unsigned NOT NULL,
  `RelatedPersonID` int(10) unsigned NOT NULL,
  `Label` varchar(255) NOT NULL,
  `Notes` varchar(255) DEFAULT NULL,
  `Slot` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `PersonRelationship` (`PersonID`,`RelatedPersonID`),
  UNIQUE KEY `PersonSlot` (`PersonID`,`Slot`),
  KEY `PersonID` (`PersonID`),
  KEY `RelatedPersonID` (`RelatedPersonID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `relationships` VALUES (1,'Emergence\\People\\Relationship','2021-10-11 17:27:06',3,'2021-10-11 17:27:43',3,29,4,'kid',NULL,NULL);
INSERT INTO `relationships` VALUES (2,'Emergence\\People\\GuardianRelationship','2021-10-11 17:27:06',3,NULL,NULL,4,29,'parent',NULL,NULL);
INSERT INTO `relationships` VALUES (3,'Emergence\\People\\Relationship','2021-10-11 17:27:15',3,NULL,NULL,30,4,'child',NULL,NULL);
INSERT INTO `relationships` VALUES (4,'Emergence\\People\\GuardianRelationship','2021-10-11 17:27:15',3,NULL,NULL,4,30,'mother',NULL,NULL);
INSERT INTO `relationships` VALUES (5,'Emergence\\People\\Relationship','2021-10-11 17:27:24',3,NULL,NULL,31,4,'child',NULL,NULL);
INSERT INTO `relationships` VALUES (6,'Emergence\\People\\Relationship','2021-10-11 17:27:24',3,'2021-10-11 18:21:04',3,4,31,'father',NULL,NULL);
INSERT INTO `relationships` VALUES (7,'Emergence\\People\\Relationship','2021-10-11 17:35:41',3,NULL,NULL,32,4,'coachee',NULL,NULL);
INSERT INTO `relationships` VALUES (8,'Emergence\\People\\Relationship','2021-10-11 17:35:41',3,NULL,NULL,4,32,'coach',NULL,NULL);
INSERT INTO `relationships` VALUES (9,'Emergence\\People\\Relationship','2021-10-11 17:53:25',3,NULL,NULL,33,4,'tutee',NULL,NULL);
INSERT INTO `relationships` VALUES (10,'Emergence\\People\\Relationship','2021-10-11 17:53:25',3,NULL,NULL,4,33,'tutor',NULL,NULL);

CREATE TABLE `history_relationships` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Emergence\\People\\Relationship','Emergence\\People\\GuardianRelationship') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `PersonID` int(10) unsigned NOT NULL,
  `RelatedPersonID` int(10) unsigned NOT NULL,
  `Label` varchar(255) NOT NULL,
  `Notes` varchar(255) DEFAULT NULL,
  `Slot` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `history_relationships` SELECT NULL AS RevisionID, `relationships`.* FROM `relationships`;
