<?php


// show command data
echo "\$_COMMAND:\n";
dump($_COMMAND);
echo "\n";


// show STDIN
$stdin = file_get_contents('php://input');
if ($stdin) {
    echo "STDIN:\n";
    echo rtrim($stdin);
    echo "\n\n";
}


// test logger
$logger = $_COMMAND['LOGGER'];

$logger->emergency('this is an emergency');
sleep(1);
$logger->alert('this is an alert');
sleep(1);
$logger->critical('this is an critical');
sleep(1);
$logger->error('this is an error');
sleep(1);
$logger->warning('this is an warning');
sleep(1);
$logger->notice('this is an notice');
sleep(1);
$logger->info('this is an info');
sleep(1);
$logger->debug('this is an debug');
sleep(1);
