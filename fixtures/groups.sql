/*!40103 SET TIME_ZONE='+00:00' */;
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `groups` VALUES (1,'Emergence\\People\\Groups\\Organization','2019-01-02 03:04:05',1,'Example School','example_school','Active',NULL,1,28,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (2,'Emergence\\People\\Groups\\Organization','2019-01-02 03:04:05',1,'Jarvus Innovations','jarvus','Active',NULL,29,30,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (3,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Students','students','Active',1,2,13,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (4,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Parents','parents','Active',1,14,17,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (5,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Staff','staff','Active',1,18,23,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (6,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Alumni','alumni','Active',1,24,27,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (7,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2020','class_of_2020','Active',3,3,4,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (8,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2021','class_of_2021','Active',3,5,6,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (9,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2022','class_of_2022','Active',3,7,8,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (10,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2023','class_of_2023','Active',3,9,10,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (11,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'HSA','hsa','Active',4,15,16,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (12,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Teachers','teachers','Active',5,19,20,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (13,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Student Teachers','student_teachers','Active',5,21,22,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (14,'Emergence\\People\\Groups\\Group','2019-01-02 03:04:05',1,'Class of 2019','class_of_2019','Active',6,25,26,'2019-01-02 03:04:05',NULL);
INSERT INTO `groups` VALUES (15,'Emergence\\People\\Groups\\Group','2021-05-28 13:31:46',2,'Class of 2024','class_of_2024','Active',3,11,12,'2021-05-28 13:31:46',NULL);
