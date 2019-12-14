<?php

use Emergence\Connectors\Job;

$logger = $_COMMAND['LOGGER'];


// load template
if (empty($_COMMAND['ARGS'])) {
    die('Usage: connectors:run-job <job-handle>');
}

$TemplateJob = Job::getByHandle($_COMMAND['ARGS']);

if (!$TemplateJob) {
    $logger->error("Could not find job: $_COMMAND[ARGS]");
    exit(1);
}

echo "Loaded template: ";
dump($TemplateJob->getData());
echo "\n";


// create job from template
$Job = Job::create([
    'Connector' => $TemplateJob->Connector,
    'Template' => $TemplateJob,
    'Config' => $TemplateJob->Config
]);

echo "Created job: ";
dump($Job->getData());
echo "\n";


// create logger
$Job->setLogger($logger);


// reduce error reporting
error_reporting(E_ALL & ~E_NOTICE);


// set time limit
set_time_limit(0);


// start synchronize
$connectorClass = $Job->Connector;
$connectorClass::synchronize($Job, false);
