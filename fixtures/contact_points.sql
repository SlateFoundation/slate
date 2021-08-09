/*!40103 SET TIME_ZONE='+00:00' */;
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `contact_points` VALUES (1,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,1,'Email','slate+system@example.org');
INSERT INTO `contact_points` VALUES (2,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,2,'Email','slate+admin@example.org');
INSERT INTO `contact_points` VALUES (3,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,3,'Email','slate+teacher@example.org');
INSERT INTO `contact_points` VALUES (4,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,4,'Email','slate+student@example.org');
INSERT INTO `contact_points` VALUES (5,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,5,'Email','slate+teacher2@example.org');
INSERT INTO `contact_points` VALUES (6,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,6,'Email','slate+student2@example.org');
INSERT INTO `contact_points` VALUES (7,'Emergence\\People\\ContactPoint\\Email','2019-01-02 03:04:05',NULL,NULL,NULL,7,'School Email','slate+student3@example.com');
INSERT INTO `contact_points` VALUES (8,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:38',NULL,NULL,NULL,8,'Imported Email','10023464@example.org');
INSERT INTO `contact_points` VALUES (9,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:38',NULL,NULL,NULL,9,'Imported Email','10023460@example.org');
INSERT INTO `contact_points` VALUES (10,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:39',NULL,NULL,NULL,10,'Imported Email','10023458@example.org');
INSERT INTO `contact_points` VALUES (11,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:40',NULL,NULL,NULL,11,'Imported Email','10023457@example.org');
INSERT INTO `contact_points` VALUES (12,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:40',NULL,NULL,NULL,12,'Imported Email','10023469@example.org');
INSERT INTO `contact_points` VALUES (13,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:41',NULL,NULL,NULL,13,'Imported Email','10023474@example.org');
INSERT INTO `contact_points` VALUES (14,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:41',NULL,NULL,NULL,14,'Imported Email','10023475@example.org');
INSERT INTO `contact_points` VALUES (15,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:42',NULL,NULL,NULL,15,'Imported Email','10023461@example.org');
INSERT INTO `contact_points` VALUES (16,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:42',NULL,NULL,NULL,16,'Imported Email','10023470@example.org');
INSERT INTO `contact_points` VALUES (17,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:43',NULL,NULL,NULL,17,'Imported Email','10023466@example.org');
INSERT INTO `contact_points` VALUES (18,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:43',NULL,NULL,NULL,18,'Imported Email','10023467@example.org');
INSERT INTO `contact_points` VALUES (19,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:44',NULL,NULL,NULL,19,'Imported Email','10023465@example.org');
INSERT INTO `contact_points` VALUES (20,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:45',NULL,NULL,NULL,20,'Imported Email','10023463@example.org');
INSERT INTO `contact_points` VALUES (21,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:45',NULL,NULL,NULL,21,'Imported Email','10023468@example.org');
INSERT INTO `contact_points` VALUES (22,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:46',NULL,NULL,NULL,22,'Imported Email','10023471@example.org');
INSERT INTO `contact_points` VALUES (23,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:46',NULL,NULL,NULL,23,'Imported Email','10023473@example.org');
INSERT INTO `contact_points` VALUES (24,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:47',NULL,NULL,NULL,24,'Imported Email','10023459@example.org');
INSERT INTO `contact_points` VALUES (25,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:47',NULL,NULL,NULL,25,'Imported Email','10023462@example.org');
INSERT INTO `contact_points` VALUES (26,'Emergence\\People\\ContactPoint\\Email','2021-05-28 13:31:48',NULL,NULL,NULL,26,'Imported Email','10023456@example.org');


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
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `history_contact_points` SELECT NULL AS RevisionID, `contact_points`.* FROM `contact_points`;
