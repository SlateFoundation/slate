/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\People\\Groups\\Group','Emergence\\People\\Groups\\Organization') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Name` varchar(255) NOT NULL,
  `Handle` varchar(255) NOT NULL,
  `Status` enum('Active','Disabled') NOT NULL DEFAULT 'Active',
  `ParentID` int(10) unsigned DEFAULT NULL,
  `Left` int(10) unsigned DEFAULT NULL,
  `Right` int(10) unsigned DEFAULT NULL,
  `Founded` timestamp NULL DEFAULT NULL,
  `About` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`),
  UNIQUE KEY `Left` (`Left`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `groups` VALUES (1,'Emergence\\People\\Groups\\Organization','2019-01-02 03:04:05',1,'Example School','example_school','Active',NULL,1,26,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (2,'Emergence\\People\\Groups\\Organization','2019-01-02 03:04:05',1,'Jarvus Innovations','jarvus','Active',NULL,27,28,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (3,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Students','students','Active',1,2,11,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (4,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Parents','parents','Active',1,12,15,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (5,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Staff','staff','Active',1,16,21,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (6,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Alumni','alumni','Active',1,22,25,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (7,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2020','class_of_2020','Active',3,3,4,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (8,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2021','class_of_2021','Active',3,5,6,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (9,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2022','class_of_2022','Active',3,7,8,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (10,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2023','class_of_2023','Active',3,9,10,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (11,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'HSA','hsa','Active',4,13,14,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (12,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Teachers','teachers','Active',5,17,18,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (13,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Student Teachers','student_teachers','Active',5,19,20,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (14,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2019','class_of_2019','Active',6,23,24,'2019-01-02 03:04:05',NULL);
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

