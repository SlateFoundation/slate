/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `content` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\CMS\\Page','Emergence\\CMS\\BlogPost') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `ContextClass` varchar(255) DEFAULT NULL,
  `ContextID` int(10) unsigned DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Handle` varchar(255) NOT NULL,
  `AuthorID` int(10) unsigned NOT NULL,
  `Status` enum('Draft','Published','Hidden','Deleted') NOT NULL DEFAULT 'Published',
  `Published` timestamp NULL DEFAULT NULL,
  `Visibility` enum('Public','Private') NOT NULL DEFAULT 'Public',
  `Summary` text,
  `LayoutClass` enum('OneColumn') DEFAULT 'OneColumn',
  `LayoutConfig` json DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Handle` (`Handle`),
  KEY `Published` (`Published`),
  KEY `CONTEXT` (`ContextClass`,`ContextID`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `content` VALUES (1,'Emergence\\CMS\\BlogPost','2021-12-26 02:44:15',3,'2021-12-26 02:44:39',3,'Slate\\Courses\\Section',2,'1st post from teacher','st_post_from_teacher',3,'Published','2021-12-26 02:44:00','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (2,'Emergence\\CMS\\BlogPost','2021-12-26 02:46:48',4,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student','post_from_student',4,'Published','2021-12-26 02:46:48','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (3,'Emergence\\CMS\\BlogPost','2021-12-26 02:47:16',4,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student','post_from_student-2',4,'Published','2021-12-26 02:47:17','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (4,'Emergence\\CMS\\BlogPost','2021-12-26 02:51:07',6,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student2','post_from_student2',6,'Published','2021-12-26 02:51:08','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (5,'Emergence\\CMS\\BlogPost','2021-12-26 02:51:52',6,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student2','post_from_student2-2',6,'Published','2021-12-26 02:51:52','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (6,'Emergence\\CMS\\BlogPost','2021-12-26 02:52:13',6,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student2','post_from_student2-3',6,'Published','2021-12-26 02:52:13','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (7,'Emergence\\CMS\\BlogPost','2021-12-26 02:53:36',4,'2021-12-26 02:53:45',4,'Slate\\Courses\\Section',2,'Post from student','post_from_student-3',4,'Published','2021-12-26 02:53:00','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (8,'Emergence\\CMS\\BlogPost','2021-12-26 02:54:13',4,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student','post_from_student-4',4,'Published','2021-12-26 02:54:13','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (9,'Emergence\\CMS\\BlogPost','2021-12-26 02:54:33',4,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student','post_from_student-5',4,'Published','2021-12-26 02:54:33','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (10,'Emergence\\CMS\\BlogPost','2021-12-26 02:55:49',3,'2021-12-26 02:56:51',3,'Slate\\Courses\\Section',2,'This is the 2nd post from teacher','this_is_the_2nd_post_from_teacher',3,'Published','2021-12-26 02:55:00','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (11,'Emergence\\CMS\\BlogPost','2021-12-26 02:56:24',3,'2021-12-26 02:57:01',3,'Slate\\Courses\\Section',2,'This is the 3rd post from teacher','this_is_the_3rd_post_from_teacher',3,'Published','2021-12-26 02:56:00','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (12,'Emergence\\CMS\\BlogPost','2021-12-26 02:57:56',6,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student2','post_from_student2-4',6,'Published','2021-12-26 02:57:57','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (13,'Emergence\\CMS\\BlogPost','2021-12-26 02:58:20',6,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student2','post_from_student2-5',6,'Published','2021-12-26 02:58:20','Public',NULL,'OneColumn',NULL);
INSERT INTO `content` VALUES (14,'Emergence\\CMS\\BlogPost','2021-12-26 02:58:47',6,NULL,NULL,'Slate\\Courses\\Section',2,'Post from student2','post_from_student2-6',6,'Published','2021-12-26 02:58:48','Public',NULL,'OneColumn',NULL);
