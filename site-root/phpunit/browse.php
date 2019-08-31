<?php
$GLOBALS['Session']->requireAccountLevel('Developer');
?>
<html>
    <body>
    <?php
    if (empty($_GET['suite'])) {
        ?>
        <h1>Available PHPUnit Test Suites</h1>
        <ul>
        <?php
        Emergence_FS::cacheTree('phpunit-tests');
        foreach (Emergence_FS::getAggregateChildren('phpunit-tests') AS $testsSubNode) {
            if (!is_a($testsSubNode, 'SiteCollection')) {
                continue;
            }

            print "<li><a href='?suite=$testsSubNode->Handle'>$testsSubNode->Handle</a> <form action='/phpunit/run?suite=$testsSubNode->Handle' method='POST' style='display:inline'><input type='submit' value='Run All Tests'></form></li>";
        }
        ?>
        </ul>
    <?php

    } elseif (count($testNodes = Emergence_FS::getAggregateChildren("phpunit-tests/$_GET[suite]"))) {
        ?>
        <h1>Tests in suite <?=htmlspecialchars($_GET['suite'])?></h1>
        <form action="/phpunit/run?suite=<?=urlencode($_GET['suite'])?>"" method='POST'>
            <input type='submit' value='Run All Tests'>
        </form>
        <ul>
        <?php
        foreach ($testNodes AS $testNode) {
            if (is_a($testNode, 'SiteCollection')) {
                if ($testNode->Handle == 'src' || $testNode->Handle == 'data') {
                    continue;
                }
                print "<li><a href='?suite=$_GET[suite]/$testNode->Handle'>$testNode->Handle</a> <form action='/phpunit/run?suite=$_GET[suite]/$testNode->Handle' method='POST' style='display:inline'><input type='submit' value='Run All Tests'></form></li>";
            } else {
                if (!preg_match('/Test\\.php$/', $testNode->Handle) || preg_match('/^Abstract/', $testNode->Handle)) {
                    continue;
                }
                print "<li>$testNode->Handle <form action='/phpunit/run?suite=$_GET[suite]&test=$testNode->Handle' method='POST' style='display:inline'><input type='submit' value='Run Test'></form></li>";
            }
        }
        ?>
        </ul>
    <?php

    } else {
        echo "Suite not found";
    }
    ?>
    </body>
</html>