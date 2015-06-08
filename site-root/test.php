<?php


var_dump([\Emergence\Mailer\Mailer::send('aharley40@gmail.com', 'testing', 'woot'),error_get_last()]);