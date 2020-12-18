/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_members` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\People\\Groups\\GroupMember') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `GroupID` int(10) unsigned NOT NULL,
  `PersonID` int(10) unsigned NOT NULL,
  `Role` enum('Member','Administrator','Owner','Founder') NOT NULL,
  `Rank` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Joined` timestamp NULL DEFAULT NULL,
  `Expires` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `GroupPerson` (`GroupID`,`PersonID`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `group_members` VALUES (1,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,2,1,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (2,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,5,2,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (3,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,12,3,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (4,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,12,5,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (5,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,7,4,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (6,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,7,6,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (7,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,7,7,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

