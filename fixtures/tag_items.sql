/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `tag_items` (
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `ContextClass` varchar(255) DEFAULT NULL,
  `ContextID` int(11) DEFAULT NULL,
  `TagID` int(11) NOT NULL,
  UNIQUE KEY `TagItem` (`TagID`,`ContextClass`,`ContextID`),
  KEY `CONTEXT` (`ContextClass`,`ContextID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `tag_items` VALUES ('2021-12-26 02:44:16',3,'Emergence\\CMS\\AbstractContent',1,1);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:56:51',3,'Emergence\\CMS\\AbstractContent',10,1);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:57:01',3,'Emergence\\CMS\\AbstractContent',11,1);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:46:48',4,'Emergence\\CMS\\AbstractContent',2,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:47:16',4,'Emergence\\CMS\\AbstractContent',3,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:51:07',6,'Emergence\\CMS\\AbstractContent',4,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:51:52',6,'Emergence\\CMS\\AbstractContent',5,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:52:13',6,'Emergence\\CMS\\AbstractContent',6,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:53:45',4,'Emergence\\CMS\\AbstractContent',7,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:54:13',4,'Emergence\\CMS\\AbstractContent',8,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:54:33',4,'Emergence\\CMS\\AbstractContent',9,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:56:51',3,'Emergence\\CMS\\AbstractContent',10,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:57:01',3,'Emergence\\CMS\\AbstractContent',11,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:57:56',6,'Emergence\\CMS\\AbstractContent',12,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:58:20',6,'Emergence\\CMS\\AbstractContent',13,2);
INSERT INTO `tag_items` VALUES ('2021-12-26 02:58:47',6,'Emergence\\CMS\\AbstractContent',14,2);
