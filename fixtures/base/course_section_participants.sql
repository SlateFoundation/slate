/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
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
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `course_section_participants` VALUES (1,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,3,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (2,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,5,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (3,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,4,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (4,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,6,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (5,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,1,2,'Observer',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (6,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,3,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (7,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,5,'Teacher',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (8,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,4,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (9,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,6,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (10,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,2,2,'Observer',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (11,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,4,4,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (12,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,4,6,'Student',NULL,NULL,NULL);
INSERT INTO `course_section_participants` VALUES (13,'Slate\\Courses\\SectionParticipant','2019-01-02 03:04:05',1,5,4,'Student',NULL,NULL,NULL);
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

