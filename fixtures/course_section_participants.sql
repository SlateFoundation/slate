/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `course_section_participants` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Slate\\Courses\\SectionParticipant') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `CourseSectionID` int(10) unsigned NOT NULL,
  `PersonID` int(10) unsigned NOT NULL,
  `Role` enum('Observer','Student','Assistant','Teacher') NOT NULL,
  `StartDate` timestamp NULL DEFAULT NULL,
  `EndDate` timestamp NULL DEFAULT NULL,
  `Cohort` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Participant` (`CourseSectionID`,`PersonID`),
  KEY `PersonID` (`PersonID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `course_section_participants` VALUES (1,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,3,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (2,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,5,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (3,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,4,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (4,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,6,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (5,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,2,'Observer',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (6,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,3,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (7,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,5,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (8,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,4,'Student',NULL,NULL,'Group A');
INSERT INTO `course_section_participants` VALUES (9,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,6,'Student',NULL,NULL,'Group B');
INSERT INTO `course_section_participants` VALUES (10,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,2,'Observer',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (11,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,4,4,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (12,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,4,6,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (13,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,5,4,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (14,'Slate\\Courses\\SectionParticipant','2021-05-28 20:58:46',3,6,3,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (15,'Slate\\Courses\\SectionParticipant','2021-05-28 20:59:20',3,6,24,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (16,'Slate\\Courses\\SectionParticipant','2021-05-28 20:59:31',3,6,25,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (17,'Slate\\Courses\\SectionParticipant','2021-05-28 20:59:35',3,6,26,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (18,'Slate\\Courses\\SectionParticipant','2021-05-28 20:59:44',3,6,23,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (19,'Slate\\Courses\\SectionParticipant','2021-05-29 13:05:06',5,7,5,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (20,'Slate\\Courses\\SectionParticipant','2021-05-29 13:05:37',5,7,10,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (21,'Slate\\Courses\\SectionParticipant','2021-05-29 13:05:42',5,7,9,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (22,'Slate\\Courses\\SectionParticipant','2021-05-29 13:05:48',5,7,12,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (23,'Slate\\Courses\\SectionParticipant','2021-05-29 13:05:58',5,7,8,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (24,'Slate\\Courses\\SectionParticipant','2021-05-29 13:06:05',5,7,11,'Student',NULL,NULL,NULL);
