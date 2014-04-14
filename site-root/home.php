<?php

if ($GLOBALS['Session']->Person && empty($_GET['nodashboard'])) {
    Site::redirect('/dashboard');
} else {
    RequestHandler::respond('home');
}