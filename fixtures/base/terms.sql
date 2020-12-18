/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `terms` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Slate\\Term') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Handle` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `ParentID` int(10) unsigned DEFAULT NULL,
  `Left` int(10) unsigned DEFAULT NULL,
  `Right` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`),
  UNIQUE KEY `Left` (`Left`),
  FULLTEXT KEY `FULLTEXT` (`Title`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `terms` VALUES (1,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:45:34',1,'2017-18','y2017','Live','2017-09-01','2018-04-30',NULL,1,14);
INSERT INTO `terms` VALUES (2,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:44:30',1,'2017-18: 1st Semester','s2017-1','Live','2017-09-01','2017-12-31',1,2,7);
INSERT INTO `terms` VALUES (3,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:45:31',1,'2017-18: 2nd Semester','s2017-2','Live','2018-01-01','2018-04-30',1,8,13);
INSERT INTO `terms` VALUES (4,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:43:59',1,'2017-18: 1st Quarter','q2017-1','Live','2017-09-01','2017-10-31',2,3,4);
INSERT INTO `terms` VALUES (5,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:44:15',1,'2017-18: 2nd Quarter','q2017-2','Live','2017-11-01','2017-12-31',2,5,6);
INSERT INTO `terms` VALUES (6,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:45:59',1,'2017-18: 3rd Quarter','q2017-3','Live','2018-01-01','2018-02-28',3,9,10);
INSERT INTO `terms` VALUES (7,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:44:59',1,'2017-18: 4th Quarter','q2017-4','Live','2018-03-01','2018-04-30',3,11,12);
INSERT INTO `terms` VALUES (8,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19','y2018','Live','2018-09-01','2019-04-30',NULL,15,28);
INSERT INTO `terms` VALUES (9,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 1st Semester','s2018-1','Live','2018-09-01','2018-12-31',8,16,21);
INSERT INTO `terms` VALUES (10,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 2nd Semester','s2018-2','Live','2019-01-01','2019-04-30',8,22,27);
INSERT INTO `terms` VALUES (11,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 1st Quarter','q2018-1','Live','2018-09-01','2018-10-31',9,17,18);
INSERT INTO `terms` VALUES (12,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 2nd Quarter','q2018-2','Live','2018-11-01','2018-12-31',9,19,20);
INSERT INTO `terms` VALUES (13,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 3rd Quarter','q2018-3','Live','2019-01-01','2019-02-28',10,23,24);
INSERT INTO `terms` VALUES (14,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 4th Quarter','q2018-4','Live','2019-03-01','2019-04-30',10,25,26);
INSERT INTO `terms` VALUES (15,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20','y2019','Live','2019-09-01','2020-04-30',NULL,29,42);
INSERT INTO `terms` VALUES (16,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 1st Semester','s2019-1','Live','2019-09-01','2019-12-31',15,30,35);
INSERT INTO `terms` VALUES (17,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 2nd Semester','s2019-2','Live','2020-01-01','2020-04-30',15,36,41);
INSERT INTO `terms` VALUES (18,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 1st Quarter','q2019-1','Live','2019-09-01','2019-10-31',16,31,32);
INSERT INTO `terms` VALUES (19,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 2nd Quarter','q2019-2','Live','2019-11-01','2019-12-31',16,33,34);
INSERT INTO `terms` VALUES (20,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 3rd Quarter','q2019-3','Live','2020-01-01','2020-02-28',17,37,38);
INSERT INTO `terms` VALUES (21,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 4th Quarter','q2019-4','Live','2020-03-01','2020-04-30',17,39,40);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history_terms` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Slate\\Term') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Handle` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `ParentID` int(10) unsigned DEFAULT NULL,
  `Left` int(10) unsigned DEFAULT NULL,
  `Right` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `history_terms` VALUES (1,1,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:45:34',1,'2017-18','y2017','Live','2017-09-01','2018-04-30',NULL,1,14);
INSERT INTO `history_terms` VALUES (2,2,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:44:30',1,'2017-18: 1st Semester','s2017-1','Live','2017-09-01','2017-12-31',1,2,7);
INSERT INTO `history_terms` VALUES (3,3,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:45:31',1,'2017-18: 2nd Semester','s2017-2','Live','2018-01-01','2018-04-30',1,8,13);
INSERT INTO `history_terms` VALUES (4,4,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:43:59',1,'2017-18: 1st Quarter','q2017-1','Live','2017-09-01','2017-10-31',2,3,4);
INSERT INTO `history_terms` VALUES (5,5,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:44:15',1,'2017-18: 2nd Quarter','q2017-2','Live','2017-11-01','2017-12-31',2,5,6);
INSERT INTO `history_terms` VALUES (6,6,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:45:59',1,'2017-18: 3rd Quarter','q2017-3','Live','2018-01-01','2018-02-28',3,9,10);
INSERT INTO `history_terms` VALUES (7,7,'Slate\\Term','2019-01-02 03:04:05',1,'2019-06-05 05:44:59',1,'2017-18: 4th Quarter','q2017-4','Live','2018-03-01','2018-04-30',3,11,12);
INSERT INTO `history_terms` VALUES (8,8,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19','y2018','Live','2018-09-01','2019-04-30',NULL,15,28);
INSERT INTO `history_terms` VALUES (9,9,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 1st Semester','s2018-1','Live','2018-09-01','2018-12-31',8,16,21);
INSERT INTO `history_terms` VALUES (10,10,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 2nd Semester','s2018-2','Live','2019-01-01','2019-04-30',8,22,27);
INSERT INTO `history_terms` VALUES (11,11,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 1st Quarter','q2018-1','Live','2018-09-01','2018-10-31',9,17,18);
INSERT INTO `history_terms` VALUES (12,12,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 2nd Quarter','q2018-2','Live','2018-11-01','2018-12-31',9,19,20);
INSERT INTO `history_terms` VALUES (13,13,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 3rd Quarter','q2018-3','Live','2019-01-01','2019-02-28',10,23,24);
INSERT INTO `history_terms` VALUES (14,14,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2018-19: 4th Quarter','q2018-4','Live','2019-03-01','2019-04-30',10,25,26);
INSERT INTO `history_terms` VALUES (15,15,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20','y2019','Live','2019-09-01','2020-04-30',NULL,29,42);
INSERT INTO `history_terms` VALUES (16,16,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 1st Semester','s2019-1','Live','2019-09-01','2019-12-31',15,30,35);
INSERT INTO `history_terms` VALUES (17,17,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 2nd Semester','s2019-2','Live','2020-01-01','2020-04-30',15,36,41);
INSERT INTO `history_terms` VALUES (18,18,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 1st Quarter','q2019-1','Live','2019-09-01','2019-10-31',16,31,32);
INSERT INTO `history_terms` VALUES (19,19,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 2nd Quarter','q2019-2','Live','2019-11-01','2019-12-31',16,33,34);
INSERT INTO `history_terms` VALUES (20,20,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 3rd Quarter','q2019-3','Live','2020-01-01','2020-02-28',17,37,38);
INSERT INTO `history_terms` VALUES (21,21,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,'2019-20: 4th Quarter','q2019-4','Live','2020-03-01','2020-04-30',17,39,40);
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

