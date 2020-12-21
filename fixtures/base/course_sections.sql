/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `course_sections` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Slate\\Courses\\Section') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Code` varchar(255) NOT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Notes` text,
  `StudentsCapacity` int(10) unsigned DEFAULT NULL,
  `TermID` int(10) unsigned DEFAULT NULL,
  `ScheduleID` int(10) unsigned DEFAULT NULL,
  `LocationID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Code` (`Code`),
  KEY `CourseID` (`CourseID`),
  FULLTEXT KEY `FULLTEXT` (`Notes`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

INSERT INTO `course_sections` VALUES (1,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-001','Live',NULL,NULL,8,1,2);
INSERT INTO `course_sections` VALUES (2,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,2,'ELA Studio','ELA-001','Live',NULL,NULL,8,2,3);
INSERT INTO `course_sections` VALUES (3,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,2,'ELA Studio','ELA-EMPTY','Live',NULL,NULL,8,3,4);
INSERT INTO `course_sections` VALUES (4,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-002','Live',NULL,NULL,11,4,NULL);
INSERT INTO `course_sections` VALUES (5,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-003','Live',NULL,NULL,15,NULL,5);


CREATE TABLE `history_course_sections` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Slate\\Courses\\Section') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `CourseID` int(10) unsigned NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Code` varchar(255) NOT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `Notes` text,
  `StudentsCapacity` int(10) unsigned DEFAULT NULL,
  `TermID` int(10) unsigned DEFAULT NULL,
  `ScheduleID` int(10) unsigned DEFAULT NULL,
  `LocationID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

INSERT INTO `history_course_sections` SELECT NULL AS RevisionID, `course_sections`.* FROM `course_sections`;
