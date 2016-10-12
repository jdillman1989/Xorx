<?php

// Get and format data
$data = $_GET["data"];
$session = $_GET["session"];

$logfile = fopen("/var/www/games/xorx/logs/".$session, "w") or die("Unable to open file: ".$session);
fwrite($logfile, $data);
fclose($logfile);

?>