/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `content_items` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\CMS\\Item\\Album','Emergence\\CMS\\Item\\Embed','Emergence\\CMS\\Item\\Media','Emergence\\CMS\\Item\\RichText','Emergence\\CMS\\Item\\Text','Emergence\\CMS\\Item\\Markdown') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) DEFAULT NULL,
  `ContentID` int(10) unsigned NOT NULL,
  `AuthorID` int(10) unsigned NOT NULL,
  `Status` enum('Draft','Published','Hidden','Deleted') NOT NULL DEFAULT 'Published',
  `Order` int(10) unsigned DEFAULT NULL,
  `Data` json NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `ContentID` (`ContentID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `content_items` VALUES (1,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:44:15',3,'2021-12-26 02:44:39',3,NULL,1,3,'Deleted',1,'\"Here is some information about the course\\n - Lorem ipsum dolor sit amet\\n - consectetur adipiscing elit\"');
INSERT INTO `content_items` VALUES (2,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:44:39',3,NULL,NULL,NULL,1,3,'Published',1,'\"Here is some information about the course\\n - Lorem ipsum dolor sit amet\\n - consectetur adipiscing elit\"');
INSERT INTO `content_items` VALUES (3,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:46:48',4,NULL,NULL,NULL,2,4,'Published',1,'\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \"');
INSERT INTO `content_items` VALUES (4,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:47:16',4,NULL,NULL,NULL,3,4,'Published',1,'\"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"');
INSERT INTO `content_items` VALUES (5,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:51:07',6,NULL,NULL,NULL,4,6,'Published',1,'\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \"');
INSERT INTO `content_items` VALUES (6,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:51:52',6,NULL,NULL,NULL,5,6,'Published',1,'\"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\"');
INSERT INTO `content_items` VALUES (7,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:52:13',6,NULL,NULL,NULL,6,6,'Published',1,'\"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"');
INSERT INTO `content_items` VALUES (8,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:53:36',4,NULL,NULL,NULL,7,4,'Published',1,'\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\"');
INSERT INTO `content_items` VALUES (9,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:54:13',4,NULL,NULL,NULL,8,4,'Published',1,'\"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\"');
INSERT INTO `content_items` VALUES (10,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:54:33',4,NULL,NULL,NULL,9,4,'Published',1,'\"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"');
INSERT INTO `content_items` VALUES (11,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:55:49',3,NULL,NULL,NULL,10,3,'Published',1,'\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \"');
INSERT INTO `content_items` VALUES (12,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:56:24',3,NULL,NULL,NULL,11,3,'Published',1,'\"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"');
INSERT INTO `content_items` VALUES (13,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:57:56',6,NULL,NULL,NULL,12,6,'Published',1,'\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \"');
INSERT INTO `content_items` VALUES (14,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:58:20',6,NULL,NULL,NULL,13,6,'Published',1,'\"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\"');
INSERT INTO `content_items` VALUES (15,'Emergence\\CMS\\Item\\Markdown','2021-12-26 02:58:47',6,NULL,NULL,NULL,14,6,'Published',1,'\"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"');
