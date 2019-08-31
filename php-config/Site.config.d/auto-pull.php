<?php

// edit or remove the if conditions to disable autoPull on an descendant site
if (Site::$hostname == 'skeleton.emr.ge' || Site::$hostname == 'skeleton-v2.emr.ge') {
    Site::$autoPull = false;
}