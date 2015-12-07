<?php
$file = '/var/www/games/xorx/characters.json';

$player = $_GET["data"];

$current = file_get_contents($file);

$format = substr($current, 0, -1);

$update = $format;

$update .= ",";

$update .= $player;

$update .= "]";

file_put_contents($file, $update);

echo $player;
?>