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
