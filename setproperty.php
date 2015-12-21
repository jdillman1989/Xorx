<?php

echo "starting prop set...\n";

// Get and format data
$receiveddata = $_GET["data"];
$propertyinfo = explode("& ", $receiveddata);

echo "Received data: ". $receiveddata ."\n";
echo "Format data: ". $propertyinfo ."\n";

// Parse data
$filename = $propertyinfo[0];
$objectname = $propertyinfo[1];
$propertyname = $propertyinfo[2];
$propertyvalue = $propertyinfo[3];

if ($propertyvalue === "false") {

	$propertyvalue = false;
};

echo $filename;
echo $objectname;
echo $propertyname;
echo $propertyvalue;

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
				
				$found = true;
			};
		}
		elseif ($propname == $propertyname) {
			
			if ($found){
				
				$currentjson[$key][$propertyname] = $propertyvalue;
				break 2;
			};
		};
	};
};

// Add updated JSON content
$update = json_encode($currentjson, JSON_PRETTY_PRINT);
file_put_contents($filename, $update);

?>