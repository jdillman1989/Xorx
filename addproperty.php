<?php

echo "starting new record...\n";

// Get and format data
$data = $_GET["data"];

$filename = "characters.json";

// Open JSON file and make assoc array
$file = '/var/www/games/xorx/'. $filename;
$current = file_get_contents($file);
$currentjson = json_decode($current, true);
$newjson = json_decode($data, true);

array_push($currentjson, $newjson);

// Add updated JSON content
$update = json_encode($currentjson, JSON_PRETTY_PRINT);
file_put_contents($file, $update);

?>