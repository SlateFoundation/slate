/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `people` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Person','User') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `MiddleName` varchar(255) DEFAULT NULL,
  `Gender` enum('Male','Female') DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Phone` decimal(10,0) unsigned DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `About` text,
  `PrimaryPhotoID` int(10) unsigned DEFAULT NULL,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `AccountLevel` enum('Disabled','Contact','User','Staff','Administrator','Developer') DEFAULT 'User',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `people` VALUES (1,'User','2019-01-02 03:04:05',NULL,NULL,NULL,'System','User',NULL,NULL,NULL,'system@example.org',NULL,NULL,NULL,NULL,'system',SHA1('system'),'Developer');
INSERT INTO `people` VALUES (2,'User','2019-01-02 03:04:05',NULL,NULL,NULL,'Admin','User',NULL,NULL,NULL,'admin@example.org',NULL,NULL,NULL,NULL,'admin',SHA1('admin'),'Administrator');
INSERT INTO `people` VALUES (3,'User','2019-01-02 03:04:05',NULL,NULL,NULL,'Staff','User',NULL,NULL,NULL,'staff@example.org',NULL,NULL,NULL,NULL,'staff',SHA1('staff'),'Staff');
INSERT INTO `people` VALUES (4,'User','2019-01-02 03:04:05',NULL,NULL,NULL,'Regular','User',NULL,NULL,NULL,'user@example.org',NULL,NULL,NULL,NULL,'user',SHA1('user'),'User');


CREATE TABLE `history_people` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Person','User') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `MiddleName` varchar(255) DEFAULT NULL,
  `Gender` enum('Male','Female') DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Phone` decimal(10,0) unsigned DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `About` text,
  `PrimaryPhotoID` int(10) unsigned DEFAULT NULL,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `AccountLevel` enum('Disabled','Contact','User','Staff','Administrator','Developer') DEFAULT 'User',
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `history_people` SELECT NULL AS RevisionID, `people`.* FROM `people`;
