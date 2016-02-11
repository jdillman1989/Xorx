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
$found = false;

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

// Add updated JSON content
$update = json_encode($currentjson, JSON_PRETTY_PRINT);
file_put_contents($filename, $update);

?>