<?php

// these resolved paths will skip initializing a user session
Site::$skipSessionPaths[] = 'thumbnail.php';
Site::$skipSessionPaths[] = 'min.php';