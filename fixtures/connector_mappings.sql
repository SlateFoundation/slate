/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET character_set_client = utf8 */;

-- Connector identity mappings for the merge-demo cast (see people.sql).
-- Schema captured from the framework's auto-created table
-- (Emergence\Connectors\Mapping) so fixture loads don't depend on the
-- auto-create-on-first-query path.
--
-- 48/49 (Jamie Torres): both gsuite-mapped under the same ExternalKey with
-- differing identifiers -- gsuite has no registered action deriver, so the
-- compare view surfaces this as an operator-resolved mapping conflict, and
-- 48's mapping + disabled account + zero contact points is the
-- mapping-anomaly detector's signal.
--
-- 50/51 (Avery Kim): both canvas-mapped under the connector's constant
-- 'user[id]' ExternalKey -- canvas HAS a registered deriver
-- (Slate\Connectors\Canvas\MergeSupport), so this is deliberately NOT a
-- conflict; merging spawns a canvas-user-merge follow-up action instead.

CREATE TABLE `connector_mappings` (
  `ID` int unsigned NOT NULL AUTO_INCREMENT,
  `Class` enum('Emergence\\Connectors\\Mapping') NOT NULL,
  `Created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorID` int DEFAULT NULL,
  `ContextClass` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ContextID` int unsigned NOT NULL,
  `Source` enum('creation','matching','manual') NOT NULL,
  `Connector` char(25) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ExternalKey` char(25) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `ExternalIdentifier` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Mapping` (`Connector`,`ExternalKey`,`ExternalIdentifier`),
  KEY `CONTEXT` (`ContextClass`,`ContextID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO `connector_mappings` VALUES (1,'Emergence\\Connectors\\Mapping','2017-09-01 09:00:00',2,'Emergence\\People\\Person',48,'matching','gsuite','user-key','jamie.torres@legacy.example.com');
INSERT INTO `connector_mappings` VALUES (2,'Emergence\\Connectors\\Mapping','2023-08-22 09:00:00',2,'Emergence\\People\\Person',49,'matching','gsuite','user-key','jtorres@school.example.org');
INSERT INTO `connector_mappings` VALUES (3,'Emergence\\Connectors\\Mapping','2023-08-23 09:00:00',2,'Emergence\\People\\Person',50,'matching','canvas','user[id]','7001');
INSERT INTO `connector_mappings` VALUES (4,'Emergence\\Connectors\\Mapping','2019-01-15 09:00:00',2,'Emergence\\People\\Person',51,'matching','canvas','user[id]','7002');
