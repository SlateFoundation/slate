/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `course_sections` VALUES (1,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-001','Live',NULL,NULL,15,NULL,NULL);
INSERT INTO `course_sections` VALUES (2,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,2,'ELA Studio','ELA-001','Live',NULL,NULL,15,NULL,NULL);
INSERT INTO `course_sections` VALUES (3,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,2,'ELA Studio','ELA-EMPTY','Live',NULL,NULL,15,NULL,NULL);
INSERT INTO `course_sections` VALUES (4,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-002','Live',NULL,NULL,18,NULL,NULL);
INSERT INTO `course_sections` VALUES (5,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-003','Live',NULL,NULL,8,NULL,NULL);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `history_course_sections` VALUES (1,1,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-001','Live',NULL,NULL,15,NULL,NULL);
INSERT INTO `history_course_sections` VALUES (2,2,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,2,'ELA Studio','ELA-001','Live',NULL,NULL,15,NULL,NULL);
INSERT INTO `history_course_sections` VALUES (3,3,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,2,'ELA Studio','ELA-EMPTY','Live',NULL,NULL,15,NULL,NULL);
INSERT INTO `history_course_sections` VALUES (4,4,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-002','Live',NULL,NULL,18,NULL,NULL);
INSERT INTO `history_course_sections` VALUES (5,5,'Slate\\Courses\\Section','2019-01-02 03:04:05',1,NULL,NULL,1,'Math Studio','MATH-003','Live',NULL,NULL,8,NULL,NULL);
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

