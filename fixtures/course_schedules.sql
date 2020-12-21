/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `course_schedules` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Slate\\Courses\\Schedule') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Handle` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`),
  FULLTEXT KEY `FULLTEXT` (`Title`,`Description`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;

INSERT INTO `course_schedules` VALUES (1,'Slate\\Courses\\Schedule','2019-01-02 03:04:05',1,NULL,NULL,'E Band','e','Live',NULL);
INSERT INTO `course_schedules` VALUES (2,'Slate\\Courses\\Schedule','2019-01-02 03:04:05',1,NULL,NULL,'C Band','c','Live',NULL);
INSERT INTO `course_schedules` VALUES (3,'Slate\\Courses\\Schedule','2019-01-02 03:04:05',1,NULL,NULL,'D Band','d','Live',NULL);
INSERT INTO `course_schedules` VALUES (4,'Slate\\Courses\\Schedule','2019-01-02 03:04:05',1,NULL,NULL,'A Band','a','Live',NULL);
INSERT INTO `course_schedules` VALUES (5,'Slate\\Courses\\Schedule','2019-01-02 03:04:05',1,NULL,NULL,'B Band','b','Live',NULL);
INSERT INTO `course_schedules` VALUES (6,'Slate\\Courses\\Schedule','2019-01-02 03:04:05',1,NULL,NULL,'X Band','x','Live',NULL);
INSERT INTO `course_schedules` VALUES (7,'Slate\\Courses\\Schedule','2019-01-02 03:04:05',1,NULL,NULL,'Y Band','y','Live',NULL);


CREATE TABLE `history_course_schedules` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Slate\\Courses\\Schedule') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Handle` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `history_course_schedules` SELECT NULL AS RevisionID, course_schedules.* FROM `course_schedules`;
