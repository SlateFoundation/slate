/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `courses` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Slate\\Courses\\Course') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Code` varchar(255) NOT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  `Prerequisites` text,
  `DepartmentID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Code` (`Code`),
  FULLTEXT KEY `FULLTEXT` (`Title`,`Description`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `courses` VALUES (1,'Slate\\Courses\\Course','2019-01-02 03:04:05',1,NULL,NULL,'Mathematics','MATH','Live',NULL,NULL,1);
INSERT INTO `courses` VALUES (2,'Slate\\Courses\\Course','2019-01-02 03:04:05',1,NULL,NULL,'English Language Arts','ELA','Live',NULL,NULL,2);
INSERT INTO `courses` VALUES (3,'Slate\\Courses\\Course','2021-05-28 20:57:06',1,NULL,NULL,'Social Studies','SS','Live',NULL,NULL,NULL);
INSERT INTO `courses` VALUES (4,'Slate\\Courses\\Course','2021-05-28 20:57:31',1,NULL,NULL,'Science','SCI','Live',NULL,NULL,NULL);


CREATE TABLE `history_courses` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Slate\\Courses\\Course') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Code` varchar(255) NOT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Description` text,
  `Prerequisites` text,
  `DepartmentID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `history_courses` SELECT NULL AS RevisionID, `courses`.* FROM `courses`;
