/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `course_departments` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Slate\\Courses\\Department') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Handle` varchar(255) NOT NULL,
  `Code` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`),
  UNIQUE KEY `Code` (`Code`),
  FULLTEXT KEY `FULLTEXT` (`Title`,`Description`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `course_departments` VALUES (1,'Slate\\Courses\\Department','2019-01-02 03:04:05',1,NULL,NULL,'Math','math',NULL,'Live',NULL);
INSERT INTO `course_departments` VALUES (2,'Slate\\Courses\\Department','2019-01-02 03:04:05',1,NULL,NULL,'English','english',NULL,'Live',NULL);


CREATE TABLE `history_course_departments` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Slate\\Courses\\Department') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Handle` varchar(255) NOT NULL,
  `Code` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `history_course_departments` SELECT NULL AS RevisionID, `course_departments`.* FROM `course_departments`;
