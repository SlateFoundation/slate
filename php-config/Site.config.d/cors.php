<?php

// set to * or an array of hosts
if ($origins = getenv('CORS_ORIGINS')) {
    if ($origins == '*') {
        Site::$permittedOrigins = '*';
    } else {
        Site::$permittedOrigins = explode(',', $origins);
    }
}
