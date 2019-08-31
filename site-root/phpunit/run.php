<?php

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    die('POST method required');
}

$GLOBALS['Session']->requireAccountLevel('Developer');
set_time_limit(0);
Benchmark::startLive();

// get requested test suite
$testSuite = empty($_GET['suite']) ? 'emergence.read-only' : $_GET['suite'];


// set paths
$testsPath  = "phpunit-tests";
$suitePath = "$testsPath/$testSuite";

if (!Site::resolvePath($suitePath)) {
    die('Requested test suite not found');
}

// get temporary directory and set paths
$tmpPath = Emergence_FS::getTmpDir();
$suiteTmpPath = "$tmpPath/$testSuite";
$configTmpPath = "$tmpPath/phpunit.xml";

Benchmark::mark("created tmp: $tmpPath");

// export tests
Emergence_FS::cacheTree($suitePath);
$exportResult = Emergence_FS::exportTree($suitePath, $suiteTmpPath);
Benchmark::mark("exported $suitePath to $suiteTmpPath: ".http_build_query($exportResult));

// write phpunit configuration
$timezone = date_default_timezone_get();

// bootstrap path
$bootstrapPath = dirname($_SERVER['SCRIPT_FILENAME']).'/phpunit.php';

file_put_contents($configTmpPath, <<<EOT
<?xml version="1.0" encoding="UTF-8" ?>
<phpunit bootstrap="$bootstrapPath"
         convertErrorsToExceptions="false"
         convertNoticesToExceptions="false"
         convertWarningsToExceptions="false"
         stopOnError="false">
    <php>
        <ini name="date.timezone" value="$timezone" />
		<server name="SITE_ROOT" value="$_SERVER[SITE_ROOT]" />
        <server name="HTTP_HOST" value="$_SERVER[HTTP_HOST]" />
        <server name="REQUEST_METHOD" value="GET" />
        <server name="REQUEST_URI" value="" />
        <server name="REMOTE_ADDR" value="$_SERVER[REMOTE_ADDR]" />
	</php>
</phpunit>
EOT
);

// begin cmd
$cmd = "phpunit $testSuite";

if (!empty($_GET['test'])) {
    $cmd .= "/$_GET[test]";
}

chdir($tmpPath);
Benchmark::mark("running `$cmd`");


passthru("$cmd 2>&1", $cmdStatus);
Benchmark::mark("CMD finished: exitCode=$cmdStatus");

// clean up
if (empty($_GET['leaveWorkspace'])) {
    exec("rm -R $tmpPath");
    Benchmark::mark("erased $tmpPath");
}