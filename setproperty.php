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

if (is_numeric($propertyvalue)) {
    $propertyvalue = intval($propertyvalue);
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

			if ($propertyname == "roomlocation") {
				if ($found){

					$roomlocate = explode("> ", $propertyvalue);
					$roomdirection = $roomlocate[0];
					$roomvalue = $roomlocate[1];
					
					$currentjson[$key][$propertyname][$roomdirection] = $roomvalue;
					break 2;
				};
			} 

			else {
				if ($found){
					
					$currentjson[$key][$propertyname] = $propertyvalue;
					break 2;
				};
			}
		};
	};
};

// Add updated JSON content
$update = json_encode($currentjson, JSON_PRETTY_PRINT);
file_put_contents($filename, $update);

?>