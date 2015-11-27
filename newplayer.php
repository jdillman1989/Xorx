<?php
$file = '/var/www/drupal/game/scores.json';

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