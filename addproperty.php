<?php

echo "starting new record...\n";

// Get and format data
$data = $_GET["data"];

$filename = "characters.json";

// Open JSON file and make assoc array
$file = '/var/www/games/xorx/'. $filename;
$current = file_get_contents($file);
$currentjson = json_decode($current, true);
echo "currentjson\n";
var_dump($currentjson);
echo "\n\n";
$newjson = json_decode($data, true); //null
echo "newjson\n";
var_dump($newjson);
echo "\n\n";

$newdata = array_merge($currentjson, $newjson); //null
echo "newdata\n";
var_dump($newdata);
echo "\n\n";

// Add updated JSON content
$update = json_encode($newdata, JSON_PRETTY_PRINT); //'null'
echo "update\n";
var_dump($update);
echo "\n\n";
file_put_contents($file, $update);

?>