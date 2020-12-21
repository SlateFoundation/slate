set @year_curr = YEAR(CURRENT_TIMESTAMP);
set @month_curr = MONTH(CURRENT_TIMESTAMP);

set @year_curr = IF (@month_curr >= 9, @year_curr, @year_curr - 1);
set @year_last = @year_curr - 1;
set @year_next = @year_curr + 1;
-- SELECT @year_last, @year_curr, @year_next;

set @range_last = CONCAT(@year_last,'-', @year_last - 1999);
set @range_curr = CONCAT(@year_curr,'-', @year_curr - 1999);
set @range_next = CONCAT(@year_next,'-', @year_next - 1999);
-- SELECT @range_last, @range_curr, @range_next;

INSERT INTO `terms` VALUES ( 1,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,@range_last,CONCAT('y',@year_last),'Live',CONCAT(@year_last,'-09-01'),CONCAT(@year_last+1,'-04-30'),NULL,1,14);
INSERT INTO `terms` VALUES ( 2,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_last,': 1st Semester'),CONCAT('s',@year_last,'-1'),'Live',CONCAT(@year_last,'-09-01'),CONCAT(@year_last,'-12-31'),1,2,7);
INSERT INTO `terms` VALUES ( 3,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_last,': 2nd Semester'),CONCAT('s',@year_last,'-2'),'Live',CONCAT(@year_last+1,'-01-01'),CONCAT(@year_last+1,'-04-30'),1,8,13);
INSERT INTO `terms` VALUES ( 4,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_last,': 1st Quarter'),CONCAT('q',@year_last,'-1'),'Live',CONCAT(@year_last,'-09-01'),CONCAT(@year_last,'-10-31'),2,3,4);
INSERT INTO `terms` VALUES ( 5,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_last,': 2nd Quarter'),CONCAT('q',@year_last,'-2'),'Live',CONCAT(@year_last,'-11-01'),CONCAT(@year_last,'-12-31'),2,5,6);
INSERT INTO `terms` VALUES ( 6,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_last,': 3rd Quarter'),CONCAT('q',@year_last,'-3'),'Live',CONCAT(@year_last+1,'-01-01'),CONCAT(@year_last+1,'-02-28'),3,9,10);
INSERT INTO `terms` VALUES ( 7,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_last,': 4th Quarter'),CONCAT('q',@year_last,'-4'),'Live',CONCAT(@year_last+1,'-03-01'),CONCAT(@year_last+1,'-04-30'),3,11,12);

INSERT INTO `terms` VALUES ( 8,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,@range_curr,CONCAT('y',@year_curr),'Live',CONCAT(@year_curr,'-09-01'),CONCAT(@year_curr+1,'-04-30'),NULL,15,28);
INSERT INTO `terms` VALUES ( 9,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_curr,': 1st Semester'),CONCAT('s',@year_curr,'-1'),'Live',CONCAT(@year_curr,'-09-01'),CONCAT(@year_curr,'-12-31'),8,16,21);
INSERT INTO `terms` VALUES (10,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_curr,': 2nd Semester'),CONCAT('s',@year_curr,'-2'),'Live',CONCAT(@year_curr+1,'-01-01'),CONCAT(@year_curr+1,'-04-30'),8,22,27);
INSERT INTO `terms` VALUES (11,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_curr,': 1st Quarter'),CONCAT('q',@year_curr,'-1'),'Live',CONCAT(@year_curr,'-09-01'),CONCAT(@year_curr,'-10-31'),9,17,18);
INSERT INTO `terms` VALUES (12,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_curr,': 2nd Quarter'),CONCAT('q',@year_curr,'-2'),'Live',CONCAT(@year_curr,'-11-01'),CONCAT(@year_curr,'-12-31'),9,19,20);
INSERT INTO `terms` VALUES (13,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_curr,': 3rd Quarter'),CONCAT('q',@year_curr,'-3'),'Live',CONCAT(@year_curr+1,'-01-01'),CONCAT(@year_curr+1,'-02-28'),10,23,24);
INSERT INTO `terms` VALUES (14,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_curr,': 4th Quarter'),CONCAT('q',@year_curr,'-4'),'Live',CONCAT(@year_curr+1,'-03-01'),CONCAT(@year_curr+1,'-04-30'),10,25,26);

INSERT INTO `terms` VALUES (15,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,@range_next,CONCAT('y',@year_next),'Live',CONCAT(@year_next,'-09-01'),CONCAT(@year_next+1,'-04-30'),NULL,29,42);
INSERT INTO `terms` VALUES (16,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_next,': 1st Semester'),CONCAT('s',@year_next,'-1'),'Live',CONCAT(@year_next,'-09-01'),CONCAT(@year_next,'-12-31'),15,30,35);
INSERT INTO `terms` VALUES (17,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_next,': 2nd Semester'),CONCAT('s',@year_next,'-2'),'Live',CONCAT(@year_next+1,'-01-01'),CONCAT(@year_next+1,'-04-30'),15,36,41);
INSERT INTO `terms` VALUES (18,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_next,': 1st Quarter'),CONCAT('q',@year_next,'-1'),'Live',CONCAT(@year_next,'-09-01'),CONCAT(@year_next,'-10-31'),16,31,32);
INSERT INTO `terms` VALUES (19,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_next,': 2nd Quarter'),CONCAT('q',@year_next,'-2'),'Live',CONCAT(@year_next,'-11-01'),CONCAT(@year_next,'-12-31'),16,33,34);
INSERT INTO `terms` VALUES (20,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_next,': 3rd Quarter'),CONCAT('q',@year_next,'-3'),'Live',CONCAT(@year_next+1,'-01-01'),CONCAT(@year_next+1,'-02-28'),17,37,38);
INSERT INTO `terms` VALUES (21,'Slate\\Term','2019-01-02 03:04:05',1,NULL,NULL,CONCAT(@range_next,': 4th Quarter'),CONCAT('q',@year_next,'-4'),'Live',CONCAT(@year_next+1,'-03-01'),CONCAT(@year_next+1,'-04-30'),17,39,40);

INSERT INTO `history_terms` SELECT NULL AS RevisionID, terms.* FROM `terms`;
