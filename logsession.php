<?php

// Get and format data
$data = $_GET["data"];

$time = date("d-M-Y_H:i:s\(e\)");
$logfile = fopen("logs/".$time, "w") or die("Unable to open file!");
fwrite($logfile, $data);
fclose($logfile);

?>