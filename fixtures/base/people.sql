/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `people` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\People\\Person','Emergence\\People\\User','Slate\\People\\Student') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `MiddleName` varchar(255) DEFAULT NULL,
  `PreferredName` varchar(255) DEFAULT NULL,
  `Gender` enum('Male','Female') DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `About` text,
  `PrimaryPhotoID` int(10) unsigned DEFAULT NULL,
  `PrimaryEmailID` int(10) unsigned DEFAULT NULL,
  `PrimaryPhoneID` int(10) unsigned DEFAULT NULL,
  `PrimaryPostalID` int(10) unsigned DEFAULT NULL,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `AccountLevel` enum('Disabled','Contact','User','Student','Staff','Teacher','Administrator','Developer') DEFAULT 'User',
  `TemporaryPassword` varchar(255) DEFAULT NULL,
  `StudentNumber` varchar(255) DEFAULT NULL,
  `AdvisorID` int(10) unsigned DEFAULT NULL,
  `GraduationYear` year(4) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `StudentNumber` (`StudentNumber`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `people` VALUES (1,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'System','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'system','$2y$10$Ap2JdhW3.PK9j9NGhhnvQO6aU55rNiKB/fgcpiEvtWDNUkj54T7uS','Developer',NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (2,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Admin','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,NULL,'admin','$2y$10$4GG7HXbLKMrm84TiRhl40eWpMgip2XPnDh9ykBYtiOjtXRP2bsFj.','Administrator',NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (3,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Teacher','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'teacher','$2y$10$x0vsiK0qdmZoW5m2NMoU.egE4trq1Gi2MtZdWVrXqbYVfE9Yrs0RG','Staff',NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (4,'Slate\\People\\Student','2019-01-02 03:04:05',NULL,NULL,NULL,'Student','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,NULL,NULL,'student','$2y$10$W9fLEczomvifOJS0CYIi5O0KC4aPjSGv.Wpu3KGdDNPpA2fD8.Rkq','User',NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (5,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Teacher2','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,5,NULL,NULL,'teacher2','$2y$10$tpADYt1RCQsQASt3W2VQO.yZ5CairGZjO4/KGNfwQoN5juIplqzLy','Staff',NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (6,'Slate\\People\\Student','2019-01-02 03:04:05',NULL,NULL,NULL,'Student2','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,NULL,NULL,'student2','$2y$10$tsqGd1oYRSO/xG.ZPy84r.EjjG4vd7ReEq7UcuUhorAL8/yso/kPq','User',NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (7,'Slate\\People\\Student','2019-01-02 03:04:05',NULL,NULL,NULL,'Student3','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,7,NULL,NULL,'student3','$2y$10$xQTWRIk1glWFdS5emIGoX.ARfHGScW48aI7oKTNRUJPKdv4d.3HD2','User',NULL,NULL,NULL,NULL);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history_people` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Emergence\\People\\Person','Emergence\\People\\User','Slate\\People\\Student') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `MiddleName` varchar(255) DEFAULT NULL,
  `PreferredName` varchar(255) DEFAULT NULL,
  `Gender` enum('Male','Female') DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `About` text,
  `PrimaryPhotoID` int(10) unsigned DEFAULT NULL,
  `PrimaryEmailID` int(10) unsigned DEFAULT NULL,
  `PrimaryPhoneID` int(10) unsigned DEFAULT NULL,
  `PrimaryPostalID` int(10) unsigned DEFAULT NULL,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `AccountLevel` enum('Disabled','Contact','User','Student','Staff','Teacher','Administrator','Developer') DEFAULT 'User',
  `TemporaryPassword` varchar(255) DEFAULT NULL,
  `StudentNumber` varchar(255) DEFAULT NULL,
  `AdvisorID` int(10) unsigned DEFAULT NULL,
  `GraduationYear` year(4) DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `history_people` VALUES (1,1,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'System','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'system','$2y$10$Ap2JdhW3.PK9j9NGhhnvQO6aU55rNiKB/fgcpiEvtWDNUkj54T7uS','Developer',NULL,NULL,NULL,NULL);
INSERT INTO `history_people` VALUES (2,2,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Admin','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,NULL,NULL,'admin','$2y$10$4GG7HXbLKMrm84TiRhl40eWpMgip2XPnDh9ykBYtiOjtXRP2bsFj.','Administrator',NULL,NULL,NULL,NULL);
INSERT INTO `history_people` VALUES (3,3,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Teacher','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'teacher','$2y$10$x0vsiK0qdmZoW5m2NMoU.egE4trq1Gi2MtZdWVrXqbYVfE9Yrs0RG','Staff',NULL,NULL,NULL,NULL);
INSERT INTO `history_people` VALUES (4,4,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Student','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,NULL,NULL,'student','$2y$10$W9fLEczomvifOJS0CYIi5O0KC4aPjSGv.Wpu3KGdDNPpA2fD8.Rkq','User',NULL,NULL,NULL,NULL);
INSERT INTO `history_people` VALUES (5,5,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Teacher2','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,5,NULL,NULL,'teacher2','$2y$10$tpADYt1RCQsQASt3W2VQO.yZ5CairGZjO4/KGNfwQoN5juIplqzLy','Staff',NULL,NULL,NULL,NULL);
INSERT INTO `history_people` VALUES (6,6,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Student2','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,NULL,NULL,'student2','$2y$10$tsqGd1oYRSO/xG.ZPy84r.EjjG4vd7ReEq7UcuUhorAL8/yso/kPq','User',NULL,NULL,NULL,NULL);
INSERT INTO `history_people` VALUES (7,7,'Slate\\People\\Student','2019-01-02 03:04:05',NULL,NULL,NULL,'Student3','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'student3','$2y$10$xQTWRIk1glWFdS5emIGoX.ARfHGScW48aI7oKTNRUJPKdv4d.3HD2','User',NULL,NULL,NULL,NULL);
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

