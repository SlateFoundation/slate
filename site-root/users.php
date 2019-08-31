<?php

$redirectTo = Site::$requestPath;
$redirectTo[0] = 'people';
Site::redirect($redirectTo);