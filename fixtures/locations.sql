/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `locations` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\Locations\\Location') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Handle` varchar(255) NOT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  `ParentID` int(10) unsigned DEFAULT NULL,
  `Left` int(10) unsigned DEFAULT NULL,
  `Right` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`),
  UNIQUE KEY `Left` (`Left`),
  FULLTEXT KEY `FULLTEXT` (`Title`,`Description`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `locations` VALUES (1,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'123 Main St','main_st','Live',NULL,NULL,1,16);
INSERT INTO `locations` VALUES (2,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'Room 100','room_100','Live',NULL,1,2,3);
INSERT INTO `locations` VALUES (3,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'Room 101','room_101','Live',NULL,1,4,5);
INSERT INTO `locations` VALUES (4,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'Room 102','room_102','Live',NULL,1,6,7);
INSERT INTO `locations` VALUES (5,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'Room 200','room_200','Live',NULL,1,8,9);
INSERT INTO `locations` VALUES (6,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'Room 201','room_201','Live',NULL,1,10,11);
INSERT INTO `locations` VALUES (7,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'Room 202','room_202','Live',NULL,1,12,13);
INSERT INTO `locations` VALUES (8,'Emergence\\Locations\\Location','2019-01-02 03:04:05',1,NULL,NULL,'Cafeteria','cafeteria','Live',NULL,1,14,15);


CREATE TABLE `history_locations` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Emergence\\Locations\\Location') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Handle` varchar(255) NOT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  `ParentID` int(10) unsigned DEFAULT NULL,
  `Left` int(10) unsigned DEFAULT NULL,
  `Right` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `history_locations` SELECT NULL AS RevisionID, locations.* FROM `locations`;
