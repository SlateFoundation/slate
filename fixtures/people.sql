/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `people` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\People\\Person','Emergence\\People\\User','Slate\\People\\Student') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `MiddleName` varchar(255) DEFAULT NULL,
  `PreferredName` varchar(255) DEFAULT NULL,
  `Gender` enum('Male','Female') DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `About` text,
  `PrimaryPhotoID` int(10) unsigned DEFAULT NULL,
  `PrimaryEmailID` int(10) unsigned DEFAULT NULL,
  `PrimaryPhoneID` int(10) unsigned DEFAULT NULL,
  `PrimaryPostalID` int(10) unsigned DEFAULT NULL,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `AccountLevel` enum('Disabled','Contact','User','Student','Staff','Teacher','Administrator','Developer') DEFAULT 'User',
  `TemporaryPassword` varchar(255) DEFAULT NULL,
  `StudentNumber` varchar(255) DEFAULT NULL,
  `AdvisorID` int(10) unsigned DEFAULT NULL,
  `GraduationYear` year(4) DEFAULT NULL,
  `NameSuffix` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Username` (`Username`)
  -- no UNIQUE KEY on StudentNumber: the merge-demo cast below includes a
  -- deliberate constraint-bypass duplicate (44/45), simulating the
  -- legacy-import/pre-constraint-era rows the identical-student-number
  -- detector exists to surface; the model layer still validates uniqueness
  -- on new saves
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

INSERT INTO `people` VALUES (1,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'System','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'system','$2y$10$Ap2JdhW3.PK9j9NGhhnvQO6aU55rNiKB/fgcpiEvtWDNUkj54T7uS','Developer',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (2,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Admin','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'admin','$2y$10$4GG7HXbLKMrm84TiRhl40eWpMgip2XPnDh9ykBYtiOjtXRP2bsFj.','Administrator',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (3,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Teacher','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,NULL,NULL,'teacher','$2y$10$x0vsiK0qdmZoW5m2NMoU.egE4trq1Gi2MtZdWVrXqbYVfE9Yrs0RG','Staff',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (4,'Slate\\People\\Student','2019-01-02 03:04:05',NULL,NULL,NULL,'Student','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,4,NULL,NULL,'student','$2y$10$W9fLEczomvifOJS0CYIi5O0KC4aPjSGv.Wpu3KGdDNPpA2fD8.Rkq','User',NULL,'1001',NULL,NULL,NULL);
INSERT INTO `people` VALUES (5,'Emergence\\People\\User','2019-01-02 03:04:05',NULL,NULL,NULL,'Teacher2','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,5,NULL,NULL,'teacher2','$2y$10$tpADYt1RCQsQASt3W2VQO.yZ5CairGZjO4/KGNfwQoN5juIplqzLy','Staff',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (6,'Slate\\People\\Student','2019-01-02 03:04:05',NULL,NULL,NULL,'Student2','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,NULL,NULL,'student2','$2y$10$tsqGd1oYRSO/xG.ZPy84r.EjjG4vd7ReEq7UcuUhorAL8/yso/kPq','User',NULL,'1002',NULL,NULL,NULL);
INSERT INTO `people` VALUES (7,'Slate\\People\\Student','2019-01-02 03:04:05',NULL,NULL,NULL,'Student3','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,7,NULL,NULL,'student3','$2y$10$xQTWRIk1glWFdS5emIGoX.ARfHGScW48aI7oKTNRUJPKdv4d.3HD2','User',NULL,'1003',NULL,NULL,NULL);
INSERT INTO `people` VALUES (8,'Slate\\People\\Student','2021-05-28 13:31:38',NULL,NULL,NULL,'Nydia','Neidig',NULL,NULL,NULL,NULL,NULL,NULL,NULL,8,NULL,NULL,'nneidig','$2y$10$FdUFRRCNz4KKmk73UvsR/uK1D9d5argVGH.JuQooMHlF1Ca40GrTm','User',NULL,'10023464',3,2021,NULL);
INSERT INTO `people` VALUES (9,'Slate\\People\\Student','2021-05-28 13:31:38',NULL,NULL,NULL,'Leonard','Leon',NULL,NULL,NULL,NULL,NULL,NULL,NULL,9,NULL,NULL,'lleon','$2y$10$QiQn73d/FIrtTocMk.Gh3eBF.gyHF34cHdTjziLxfknKpa6V2F5ea','User',NULL,'10023460',3,2021,NULL);
INSERT INTO `people` VALUES (10,'Slate\\People\\Student','2021-05-28 13:31:39',NULL,NULL,NULL,'Clarisa','Cross',NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,NULL,NULL,'ccross','$2y$10$MRbcqIwxKuFk53fpis5Y2e59VIFfPui4pp9bxvr4Qg/qjdZ80QXzS','User',NULL,'10023458',3,2021,NULL);
INSERT INTO `people` VALUES (11,'Slate\\People\\Student','2021-05-28 13:31:40',NULL,NULL,NULL,'Sherrill','Scherf',NULL,NULL,NULL,NULL,NULL,NULL,NULL,11,NULL,NULL,'sscherf','$2y$10$mP/NrfdHRpis3vA9mkMEiefKqMSOIVe4JrEbk7r5bEVc3Ha0z4iYe','User',NULL,'10023457',3,2021,NULL);
INSERT INTO `people` VALUES (12,'Slate\\People\\Student','2021-05-28 13:31:40',NULL,NULL,NULL,'Mollie','McClenton',NULL,NULL,NULL,NULL,NULL,NULL,NULL,12,NULL,NULL,'mmcclenton','$2y$10$Il/0.0cfgGg44rLmdr37M.xDGhIlvMCzsKi8n.3noBVOXwC/UXPgi','User',NULL,'10023469',3,2021,NULL);
INSERT INTO `people` VALUES (13,'Slate\\People\\Student','2021-05-28 13:31:41',NULL,NULL,NULL,'Omer','Overbey',NULL,NULL,NULL,NULL,NULL,NULL,NULL,13,NULL,NULL,'ooverbey','$2y$10$L4hRb1RHuaocnoNIq4AaLOhsPn8ZgLQ13sPDQcdr4jwA1dGI/V8ke','User',NULL,'10023474',3,2022,NULL);
INSERT INTO `people` VALUES (14,'Slate\\People\\Student','2021-05-28 13:31:41',NULL,NULL,NULL,'Sammy','Schlater',NULL,NULL,NULL,NULL,NULL,NULL,NULL,14,NULL,NULL,'sschlater','$2y$10$xJ5ZHszku6Fe28QCi9dykeFK41MaxFqN9ogj0Is8AFR1k6WFSoUnO','User',NULL,'10023475',3,2022,NULL);
INSERT INTO `people` VALUES (15,'Slate\\People\\Student','2021-05-28 13:31:42',NULL,NULL,NULL,'Shon','Simoneaux',NULL,NULL,NULL,NULL,NULL,NULL,NULL,15,NULL,NULL,'ssimoneaux','$2y$10$KYLuFJKZG0sjnUbGfjvPqOhQ/U3E.JuWaTcaXNS9v/LI4wF1NtP/S','User',NULL,'10023461',3,2022,NULL);
INSERT INTO `people` VALUES (16,'Slate\\People\\Student','2021-05-28 13:31:42',NULL,NULL,NULL,'Antoine','Abernathy',NULL,NULL,NULL,NULL,NULL,NULL,NULL,16,NULL,NULL,'aabernathy-2','$2y$10$uBI3Rp3TOBRxtYMumzkHYe3XcIcyQOKhJCvmsp1uRnfKk3..wlVoO','User',NULL,'10023470',3,2022,NULL);
INSERT INTO `people` VALUES (17,'Slate\\People\\Student','2021-05-28 13:31:43',NULL,NULL,NULL,'Alysha','Abernathy',NULL,NULL,NULL,NULL,NULL,NULL,NULL,17,NULL,NULL,'aabernathy','$2y$10$CXEqa1djwAkjs3kN64lh2upXpu75cci0popRVcQ2WsoMy1xf7cEsi','User',NULL,'10023466',3,2022,NULL);
INSERT INTO `people` VALUES (18,'Slate\\People\\Student','2021-05-28 13:31:43',NULL,NULL,NULL,'Maribel','Meador',NULL,NULL,NULL,NULL,NULL,NULL,NULL,18,NULL,NULL,'mmeador','$2y$10$rdosw9XgiNzbRnNYLbVO4OzOpDDSSSxl47JEYgXbzVm3xxaajayMi','User',NULL,'10023467',5,2023,NULL);
INSERT INTO `people` VALUES (19,'Slate\\People\\Student','2021-05-28 13:31:44',NULL,NULL,NULL,'Tiffany','To',NULL,NULL,NULL,NULL,NULL,NULL,NULL,19,NULL,NULL,'tto','$2y$10$JYw4gpIqGoWILGwUBGisUeZhELDdNiWp5/aK2w7h1TvPooNWz0nLO','User',NULL,'10023465',5,2023,NULL);
INSERT INTO `people` VALUES (20,'Slate\\People\\Student','2021-05-28 13:31:45',NULL,NULL,NULL,'Jenise','Jiang',NULL,NULL,NULL,NULL,NULL,NULL,NULL,20,NULL,NULL,'jjiang','$2y$10$QzPB.CP0267V1Vrr//pxt.4QIpWemjas5bJURkR0Gth1yqg./MDBe','User',NULL,'10023463',5,2023,NULL);
INSERT INTO `people` VALUES (21,'Slate\\People\\Student','2021-05-28 13:31:45',NULL,NULL,NULL,'Alfonso','Albert',NULL,NULL,NULL,NULL,NULL,NULL,NULL,21,NULL,NULL,'aalbert','$2y$10$s19Ous16gnSUXA8.xsfYveT7GKzdx/8GLcxMoYBnQnrwQNpQxNcEq','User',NULL,'10023468',5,2023,NULL);
INSERT INTO `people` VALUES (22,'Slate\\People\\Student','2021-05-28 13:31:46',NULL,NULL,NULL,'Bev','Banta',NULL,NULL,NULL,NULL,NULL,NULL,NULL,22,NULL,NULL,'bbanta','$2y$10$P1ofwSy5BfnEKHiyWhe98.8MG.C.CDvI/EBxqMfRupPFLQAsohGaW','User',NULL,'10023471',5,2023,NULL);
INSERT INTO `people` VALUES (23,'Slate\\People\\Student','2021-05-28 13:31:46',NULL,NULL,NULL,'Madalene','McClinton',NULL,NULL,NULL,NULL,NULL,NULL,NULL,23,NULL,NULL,'mmcclinton','$2y$10$zRG/egYnI55stOKkq1Odg.yNv7Db.S9mJfNpa.7i2crfQTLSH7RZq','User',NULL,'10023473',5,2024,NULL);
INSERT INTO `people` VALUES (24,'Slate\\People\\Student','2021-05-28 13:31:47',NULL,NULL,NULL,'Edmund','Ebel',NULL,NULL,NULL,NULL,NULL,NULL,NULL,24,NULL,NULL,'eebel','$2y$10$0PggepLD1ZhYE0wR3GL//OjohnJ2RJKpT9FGrfEx.1dLG6d0v/7HG','User',NULL,'10023459',5,2024,NULL);
INSERT INTO `people` VALUES (25,'Slate\\People\\Student','2021-05-28 13:31:47',NULL,NULL,NULL,'Laree','Li',NULL,NULL,NULL,NULL,NULL,NULL,NULL,25,NULL,NULL,'lli','$2y$10$Ew6.ZiBzFuCDbwU1NvJT3emDaVlkeAXogflcxE2z8nPWeL1B1rU3q','User',NULL,'10023462',5,2024,NULL);
INSERT INTO `people` VALUES (26,'Slate\\People\\Student','2021-05-28 13:31:48',NULL,NULL,NULL,'Marg','Magallanes',NULL,NULL,NULL,NULL,NULL,NULL,NULL,26,NULL,NULL,'mmagallanes','$2y$10$N/StTd.1WJooyIoevmHETeT7CSCGPxi3i56l.D5bTfJ466.ySBUBe','User',NULL,'10023456',5,2024,NULL);
INSERT INTO `people` VALUES (27,'Slate\\People\\Student','2021-05-31 01:38:55',NULL,NULL,NULL,'Student4','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'student4','$2y$10$Kw7vw88kIgssBZid05AEAuQWw8B74NX6qozV4aUrxshfmAHRSfxa6','User',NULL,'1004',NULL,NULL,NULL);
INSERT INTO `people` VALUES (28,'Slate\\People\\Student','2021-05-31 11:30:33',NULL,NULL,NULL,'Student5','Slate',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'student5','$2y$10$KtHOvlwj1DCXK8wvX2.N1.Y7UTxB5MSOG4ubHD2dqQtN1DeDvJNAW','User',NULL,'1005',NULL,NULL,NULL);
INSERT INTO `people` VALUES (29,'Emergence\\People\\Person','2021-10-11 17:27:06',3,NULL,NULL,'Guardian','Parent',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'User',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (30,'Emergence\\People\\Person','2021-10-11 17:27:15',3,NULL,NULL,'Guardian','Mother',NULL,NULL,'Female',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'User',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (31,'Emergence\\People\\Person','2021-10-11 17:27:24',3,NULL,NULL,'Nonguardian','Father',NULL,NULL,'Male',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'User',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (32,'Emergence\\People\\Person','2021-10-11 17:35:41',3,NULL,NULL,'Basketball','Coach',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'User',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (33,'Emergence\\People\\Person','2021-10-11 17:53:25',3,NULL,NULL,'Math','Tutor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'User',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (34,'Slate\\People\\Student','2022-04-25 15:39:59',NULL,NULL,NULL,'Deactivated','Student',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dstudent',NULL,'Disabled',NULL,'10023489',5,2024,NULL);

CREATE TABLE `history_people` (
  `RevisionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ID` int(10) unsigned NOT NULL,
  `Class` enum('Emergence\\People\\Person','Emergence\\People\\User','Slate\\People\\Student') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int(11) DEFAULT NULL,
  `Modified` timestamp NULL DEFAULT NULL,
  `ModifierID` int(10) unsigned DEFAULT NULL,
  `FirstName` varchar(255) NOT NULL,
  `LastName` varchar(255) NOT NULL,
  `MiddleName` varchar(255) DEFAULT NULL,
  `PreferredName` varchar(255) DEFAULT NULL,
  `Gender` enum('Male','Female') DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `About` text,
  `PrimaryPhotoID` int(10) unsigned DEFAULT NULL,
  `PrimaryEmailID` int(10) unsigned DEFAULT NULL,
  `PrimaryPhoneID` int(10) unsigned DEFAULT NULL,
  `PrimaryPostalID` int(10) unsigned DEFAULT NULL,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `AccountLevel` enum('Disabled','Contact','User','Student','Staff','Teacher','Administrator','Developer') DEFAULT 'User',
  `TemporaryPassword` varchar(255) DEFAULT NULL,
  `StudentNumber` varchar(255) DEFAULT NULL,
  `AdvisorID` int(10) unsigned DEFAULT NULL,
  `GraduationYear` year(4) DEFAULT NULL,
  `NameSuffix` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`RevisionID`),
  KEY `ID` (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


-- ============================================================================
-- Merge-demo cast (IDs 40-51): near-duplicate pairs crafted so the duplicate
-- detectors (run via /powertools/duplicate-detection.php) populate the
-- SlateAdmin merge queue with one candidate per detector plus both conflict
-- types. See cypress/integration/SlateAdmin/merge-queue.js.
--   40/41 Jordan Rivers   identical-name; shared group + tags = merge impact
--   42/43 Dana Okafor     identical-name Students w/ differing StudentNumber
--                         = StudentNumber conflict in the compare view
--   44/45 Riley Park(er)  identical-student-number (constraint bypassed)
--   46/47 Morgan/Mo Ellis shared-contact-point (same email, names differ)
--   48/49 Jamie Torres    mapping-anomaly (48 disabled + mapped, 0 contacts)
--                         + gsuite mapping conflict in the compare view
--   50/51 Avery Kim       identical-name; both canvas-mapped = merge spawns
--                         a deriver-owned canvas-user-merge follow-up action
-- ============================================================================
INSERT INTO `people` VALUES (40,'Emergence\\People\\User','2023-08-15 09:00:00',2,NULL,NULL,'Jordan','Rivers',NULL,NULL,NULL,NULL,NULL,NULL,NULL,40,NULL,NULL,'jrivers',NULL,'Staff',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (41,'Emergence\\People\\Person','2019-09-01 09:00:00',2,NULL,NULL,'Jordan','Rivers',NULL,NULL,NULL,NULL,NULL,NULL,NULL,41,NULL,NULL,NULL,NULL,'Contact',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (42,'Slate\\People\\Student','2023-08-20 09:00:00',2,NULL,NULL,'Dana','Okafor',NULL,NULL,'Female',NULL,NULL,NULL,NULL,42,NULL,NULL,'dokafor',NULL,'Student',NULL,'30042',5,2027,NULL);
INSERT INTO `people` VALUES (43,'Slate\\People\\Student','2021-09-01 09:00:00',2,NULL,NULL,'Dana','Okafor',NULL,NULL,'Female',NULL,NULL,NULL,NULL,43,NULL,NULL,'dokafor2',NULL,'Student',NULL,'30043',5,2027,NULL);
INSERT INTO `people` VALUES (44,'Slate\\People\\Student','2023-08-20 09:05:00',2,NULL,NULL,'Riley','Park',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'rpark',NULL,'Student',NULL,'30440',5,2026,NULL);
INSERT INTO `people` VALUES (45,'Slate\\People\\Student','2020-09-01 09:05:00',2,NULL,NULL,'Riley','Parker',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'rparker',NULL,'Student',NULL,'30440',5,2026,NULL);
INSERT INTO `people` VALUES (46,'Emergence\\People\\User','2023-08-21 09:00:00',2,NULL,NULL,'Morgan','Ellis',NULL,NULL,NULL,NULL,NULL,NULL,NULL,46,NULL,NULL,'mellis',NULL,'Staff',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (47,'Emergence\\People\\Person','2018-09-01 09:00:00',2,NULL,NULL,'Mo','Ellis',NULL,NULL,NULL,NULL,NULL,NULL,NULL,47,NULL,NULL,NULL,NULL,'Contact',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (48,'Emergence\\People\\Person','2017-09-01 09:00:00',2,NULL,NULL,'Jamie','Torres',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Disabled',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (49,'Emergence\\People\\User','2023-08-22 09:00:00',2,NULL,NULL,'Jamie','Torres',NULL,NULL,NULL,NULL,NULL,NULL,NULL,49,NULL,NULL,'jtorres',NULL,'Staff',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (50,'Emergence\\People\\User','2023-08-23 09:00:00',2,NULL,NULL,'Avery','Kim',NULL,NULL,NULL,NULL,NULL,NULL,NULL,50,NULL,NULL,'akim',NULL,'Staff',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `people` VALUES (51,'Emergence\\People\\Person','2019-01-15 09:00:00',2,NULL,NULL,'Avery','Kim',NULL,NULL,NULL,NULL,NULL,NULL,NULL,51,NULL,NULL,NULL,NULL,'Contact',NULL,NULL,NULL,NULL,NULL);

INSERT INTO `history_people` SELECT NULL AS RevisionID, `people`.* FROM `people`;
