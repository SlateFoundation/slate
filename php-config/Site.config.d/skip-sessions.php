<?php

// these resolved paths will skip initializing a user session
Site::$skipSessionPaths[] = 'thumbnail/';
Site::$skipSessionPaths[] = 'min/';
