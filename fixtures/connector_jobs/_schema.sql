/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `connector_jobs` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\Connectors\\Job','Slate\\Connectors\\Job') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Handle` varchar(255) NOT NULL,
  `Status` enum('Template','Pending','InProgress','Completed','Failed','Abandoned') NOT NULL DEFAULT 'Pending',
  `Connector` varchar(255) NOT NULL,
  `TemplateID` int(10) unsigned DEFAULT NULL,
  `Direction` enum('In','Out','Both') DEFAULT NULL,
  `Config` json NOT NULL,
  `Results` json DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
