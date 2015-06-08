<?php

Site::$debug = true; // set to true for extended query logging
Site::$production = false; // set to true for heavy file caching
Site::$autoPull = true; // false to disable live inheritence


// these resolved paths will skip initializing a user session
Site::$skipSessionPaths[] = 'thumbnail.php';

// uncomment or set to an array of specific hostnames to enable CORS
Site::$permittedOrigins = '*';