<?php

$GLOBALS['Session']->requireAccountLevel('Developer');
set_time_limit(0);
Benchmark::startLive();

// set paths
$rootPath  = "site-root";
$sassPath  = "$rootPath/sass";
$imgPath   = "$rootPath/img";
$fontsPath = "$rootPath/fonts";

// get temporary directory and set paths
$tmpPath = Emergence_FS::getTmpDir();
$sassTmpPath  = "$tmpPath/sass";
$imgTmpPath   = "$tmpPath/img";
$fontsTmpPath = "$tmpPath/fonts";
$cssTmpPath   = "$tmpPath/css";

Benchmark::mark("created tmp: $tmpPath");

// grab resources to work with
Emergence_FS::cacheTree($sassPath);
$exportResult = Emergence_FS::exportTree($sassPath, $sassTmpPath);
Benchmark::mark("exported $sassPath to $sassTmpPath: ".http_build_query($exportResult));

Emergence_FS::cacheTree($imgPath);
$exportResult = Emergence_FS::exportTree($imgPath, $imgTmpPath);
Benchmark::mark("exported $imgPath to $imgTmpPath: ".http_build_query($exportResult));

Emergence_FS::cacheTree($fontsPath);
$exportResult = Emergence_FS::exportTree($fontsPath, $fontsTmpPath);
Benchmark::mark("exported $fontsPath to $fontsTmpPath: ".http_build_query($exportResult));

// begin cmd
chdir($sassTmpPath);
Benchmark::mark("chdir to: $sassTmpPath");

$cmd = 'compass compile 2>&1';
Benchmark::mark("running CMD: $cmd");

passthru($cmd, $cmdStatus);
Benchmark::mark("CMD finished: exitCode=$cmdStatus");

// import build
if ($cmdStatus == 0) {
    Benchmark::mark("importing $cssTmpPath");

    $importResults = Emergence_FS::importTree($cssTmpPath, "site-root/css", array('transferDelete' => false));
    Benchmark::mark("imported files: ".http_build_query($importResults));
}

// clean up
if (empty($_GET['leaveWorkspace'])) {
    exec("rm -R $tmpPath");
    Benchmark::mark("erased $tmpPath");
}