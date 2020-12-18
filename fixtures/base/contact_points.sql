/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_points` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\People\\ContactPoint\\Email','Emergence\\People\\ContactPoint\\Phone','Emergence\\People\\ContactPoint\\Postal','Emergence\\People\\ContactPoint\\Network','Emergence\\People\\ContactPoint\\Link') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `PersonID` int(10) unsigned NOT NULL,
  `Label` varchar(255) DEFAULT NULL,
  `Data` text NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `PersonID` (`PersonID`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `contact_points` VALUES (1,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,1,'Email','slate+system@example.org');
INSERT INTO `contact_points` VALUES (2,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,2,'Email','slate+admin@example.org');
INSERT INTO `contact_points` VALUES (3,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,3,'Email','slate+teacher@example.org');
INSERT INTO `contact_points` VALUES (4,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,4,'Email','slate+student@example.org');
INSERT INTO `contact_points` VALUES (5,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,5,'Email','slate+teacher2@example.org');
INSERT INTO `contact_points` VALUES (6,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,6,'Email','slate+student2@example.org');
INSERT INTO `contact_points` VALUES (7,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,7,'School Email','slate+student3@example.com');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history_contact_points` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Emergence\\People\\ContactPoint\\Email','Emergence\\People\\ContactPoint\\Phone','Emergence\\People\\ContactPoint\\Postal','Emergence\\People\\ContactPoint\\Network','Emergence\\People\\ContactPoint\\Link') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `PersonID` int(10) unsigned NOT NULL,
  `Label` varchar(255) DEFAULT NULL,
  `Data` text NOT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `history_contact_points` VALUES (1,1,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,0,'Email','slate+system@example.org');
INSERT INTO `history_contact_points` VALUES (2,1,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,1,'Email','slate+system@example.org');
INSERT INTO `history_contact_points` VALUES (3,2,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,0,'Email','slate+admin@example.org');
INSERT INTO `history_contact_points` VALUES (4,2,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,2,'Email','slate+admin@example.org');
INSERT INTO `history_contact_points` VALUES (5,3,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,0,'Email','slate+teacher@example.org');
INSERT INTO `history_contact_points` VALUES (6,3,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,3,'Email','slate+teacher@example.org');
INSERT INTO `history_contact_points` VALUES (7,4,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,0,'Email','slate+student@example.org');
INSERT INTO `history_contact_points` VALUES (8,4,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,4,'Email','slate+student@example.org');
INSERT INTO `history_contact_points` VALUES (9,5,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,0,'Email','slate+teacher2@example.org');
INSERT INTO `history_contact_points` VALUES (10,5,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,5,'Email','slate+teacher2@example.org');
INSERT INTO `history_contact_points` VALUES (11,6,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,0,'Email','slate+student2@example.org');
INSERT INTO `history_contact_points` VALUES (12,6,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,6,'Email','slate+student2@example.org');
INSERT INTO `history_contact_points` VALUES (13,7,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,7,'School Email','slate+student3@example.com');
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

