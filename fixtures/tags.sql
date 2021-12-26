/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Tag') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Handle` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `tags` VALUES (1,'Tag','2021-12-26 02:44:16',3,'info','info',NULL);
INSERT INTO `tags` VALUES (2,'Tag','2021-12-26 02:46:48',4,'comment','comment',NULL);
