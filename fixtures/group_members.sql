/*!40103 SET TIME_ZONE='+00:00' */;
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `group_members` VALUES (1,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,2,1,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (2,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,5,2,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (3,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,12,3,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (4,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,12,5,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (5,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,7,4,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (6,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,7,6,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (7,'Emergence\\People\\Groups\\GroupMember','2019-01-02 03:04:05',1,7,7,'Member',NULL,NULL,'2019-01-02 03:04:05',NULL);
INSERT INTO `group_members` VALUES (8,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:38',2,8,8,'Member',NULL,NULL,'2021-05-28 13:31:38',NULL);
INSERT INTO `group_members` VALUES (9,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:38',2,8,9,'Member',NULL,NULL,'2021-05-28 13:31:38',NULL);
INSERT INTO `group_members` VALUES (10,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:39',2,8,10,'Member',NULL,NULL,'2021-05-28 13:31:39',NULL);
INSERT INTO `group_members` VALUES (11,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:40',2,8,11,'Member',NULL,NULL,'2021-05-28 13:31:40',NULL);
INSERT INTO `group_members` VALUES (12,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:40',2,8,12,'Member',NULL,NULL,'2021-05-28 13:31:40',NULL);
INSERT INTO `group_members` VALUES (13,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:41',2,9,13,'Member',NULL,NULL,'2021-05-28 13:31:41',NULL);
INSERT INTO `group_members` VALUES (14,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:41',2,9,14,'Member',NULL,NULL,'2021-05-28 13:31:41',NULL);
INSERT INTO `group_members` VALUES (15,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:42',2,9,15,'Member',NULL,NULL,'2021-05-28 13:31:42',NULL);
INSERT INTO `group_members` VALUES (16,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:42',2,9,16,'Member',NULL,NULL,'2021-05-28 13:31:42',NULL);
INSERT INTO `group_members` VALUES (17,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:43',2,9,17,'Member',NULL,NULL,'2021-05-28 13:31:43',NULL);
INSERT INTO `group_members` VALUES (18,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:44',2,10,18,'Member',NULL,NULL,'2021-05-28 13:31:44',NULL);
INSERT INTO `group_members` VALUES (19,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:44',2,10,19,'Member',NULL,NULL,'2021-05-28 13:31:44',NULL);
INSERT INTO `group_members` VALUES (20,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:45',2,10,20,'Member',NULL,NULL,'2021-05-28 13:31:45',NULL);
INSERT INTO `group_members` VALUES (21,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:45',2,10,21,'Member',NULL,NULL,'2021-05-28 13:31:45',NULL);
INSERT INTO `group_members` VALUES (22,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:46',2,10,22,'Member',NULL,NULL,'2021-05-28 13:31:46',NULL);
INSERT INTO `group_members` VALUES (23,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:46',2,15,23,'Member',NULL,NULL,'2021-05-28 13:31:46',NULL);
INSERT INTO `group_members` VALUES (24,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:47',2,15,24,'Member',NULL,NULL,'2021-05-28 13:31:47',NULL);
INSERT INTO `group_members` VALUES (25,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:47',2,15,25,'Member',NULL,NULL,'2021-05-28 13:31:47',NULL);
INSERT INTO `group_members` VALUES (26,'Emergence\\People\\Groups\\GroupMember','2021-05-28 13:31:48',2,15,26,'Member',NULL,NULL,'2021-05-28 13:31:48',NULL);
INSERT INTO `group_members` VALUES (29,'Emergence\\People\\Groups\\GroupMember','2021-05-31 01:40:11',2,7,27,'Member',NULL,NULL,'2021-05-31 01:40:11',NULL);
INSERT INTO `group_members` VALUES (30,'Emergence\\People\\Groups\\GroupMember','2021-05-31 11:30:33',2,7,28,'Member',NULL,NULL,'2021-05-31 11:30:33',NULL);
