<?php

echo "starting removal...\n";

// Get and format data
$receiveddata = $_GET["data"];
$propertyinfo = explode("& ", $receiveddata);

// Parse data
$filename = $propertyinfo[0];
$objectname = $propertyinfo[1];

// Open JSON file and make assoc array
$file = '/var/www/games/xorx/'. $filename;
$current = file_get_contents($file);
$currentjson = json_decode($current, true);


// Search assoc array for matching property and set new value
foreach ($currentjson as $key => $value) {
	
	foreach ($value as $propname => $propval){
		
		if ($propname == "name") {
			
			if ($propval == $objectname){
				
				unset($currentjson[$key]);
			};
		};
	};
};

var_dump($currentjson);

// Add updated JSON content
$currentjsonformat = array_values($currentjson);
$update = json_encode($currentjsonformat, JSON_PRETTY_PRINT);
var_dump($update);
file_put_contents($filename, $update);

?>