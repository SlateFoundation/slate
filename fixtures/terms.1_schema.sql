CREATE TABLE `terms` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Slate\\Term') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Handle` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `ParentID` int(10) unsigned DEFAULT NULL,
  `Left` int(10) unsigned DEFAULT NULL,
  `Right` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`),
  UNIQUE KEY `Left` (`Left`),
  FULLTEXT KEY `FULLTEXT` (`Title`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

CREATE TABLE `history_terms` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Slate\\Term') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `Handle` varchar(255) DEFAULT NULL,
  `Status` enum('Hidden','Live','Deleted') NOT NULL DEFAULT 'Live',
  `StartDate` date DEFAULT NULL,
  `EndDate` date DEFAULT NULL,
  `ParentID` int(10) unsigned DEFAULT NULL,
  `Left` int(10) unsigned DEFAULT NULL,
  `Right` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
