<?php

$memInfo = apcu_sma_info(true);

$totalBytes = $memInfo['seg_size'] * $memInfo['num_seg'];
$freeBytes = $memInfo['avail_mem'];

printf("total\t%u\n", $totalBytes);
printf("free\t%u\n", $freeBytes);
printf("used\t%u\n", $totalBytes - $freeBytes);
