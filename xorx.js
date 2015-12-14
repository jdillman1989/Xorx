$(document).ready( function(){

	$.ajaxSetup({ cache: false });

	var image = $('#screen');
	var response = $('#response');
	var input = $('#input');
	var playerNameDisplay = $('#playername');
	var inventory = $('#inventory');
	var trait = $('#trait');

	var responsePadding = "<br><br>&gt;";
	var genericError = "your command did not work. please try something different. type help for basic game instructions.";
	var gameInstructions = "you are a human mysteriously trapped on a strange alien world. is there a way back home? or maybe there is an amazing discovery to be made here...<br>basic instructions: type in the box to control your character. everything you type MUST be lower case. examples: 'take rock', 'look rock', 'go west'. if something seems broken or you have any suggestions, please email the developer at jesse@jdillman.com<br>keep in mind that there is more to this game than it may seem at first. :)";

	var prompting = false;
	var gamePrompt = "";

	var playerName = "";
	var playerHair = "";
	var playerSuit = "";

	var currentPlayer = "";
	var currentLocation = "";
	var currentInventory = "";
	var currentDescription = "";
	var currentTrait = "";

	response.append(responsePadding + "type new to start a new character. type continue to play an existing character.");

	input.keydown( function( event ) {

		playerInput = input.val();

		if ( event.which == 13 ) {

			response.append(responsePadding + playerInput);

			if (prompting) {

				parsePrompt(playerInput);
			}

			else{

				parseCommand(playerInput);
			};
		}
	});
	
	function parseCommand (userCommand) {
		
		var userCommandArray = userCommand.split(" ");

		for (var i = 0; i <= userCommandArray.length-1; i++) {

			if ( userCommandArray[i]=="at" || userCommandArray[i]=="a" || userCommandArray[i]=="the" || userCommandArray[i]=="an" || userCommandArray[i]=="with" || userCommandArray[i]=="using" || userCommandArray[i]=="to" || userCommandArray[i]=="out" ) {
				userCommandArray.splice(i, 1);
			};
		};

		var verb = userCommandArray[0];
		var subject1 = userCommandArray[1];
		var subject2 = userCommandArray[2];

		console.log("Parsing command: " + userCommandArray[0] + ", " + userCommandArray[1] + ", " + userCommandArray[2]);

		switch (verb) {
			case "look":
			case "inspect":
				look(subject1); //done
				break;
			case "say":
			case "tell":
			case "greet":
			case "call":
			case "ask":
				greet(subject1);
				break;
			case "read":
			case "decipher":
				read(subject1);
				break;
			case "give":
			case "hand":
			case "offer":
				give(subject1, subject2);
				break;
			case "take":
			case "get":
				take(subject1); //done
				break;
			case "drop":
				drop(); //done
				break;
			case "attack":
			case "shoot":
			case "fire":
				attack(subject1, subject2);
				break;
			case "activate":
			case "push":
			case "use":
				activate(subject1);
				break;
			case "go":
			case "walk":
			case "move":
			case "travel":
				move(subject1); //done
				break;
			case "help":
			case "hint":
			case "fuck":
				help(); //done
				break;
			case "new":
				createCharacter(1); //done
				break;
			case "continue":
				gamePrompt = "type the name of the character you want to play."; //done
				response.append(responsePadding + gamePrompt);
				prompting = true;
				break;
			default:
				parseError(genericError); //done
		};

		input.val("");
	};

	function parsePrompt (userAnswer) {

		switch (gamePrompt) {
			case "what is this human's name?":

				$.getJSON( 'characters.json', function(data) {

					for (var i = 0; i <= data.length-1; i++) {

						if ( data[i].name == userAnswer ) {

							response.append(responsePadding + "the character name " + userAnswer + " is already taken. please choose another name for this character.");

							gamePrompt = "what is this human's name?";
							response.append(responsePadding + gamePrompt);	
							prompting = true;	
						}

						else{

							if (i >= data.length-1) {

								playerName = userAnswer;
								createCharacter(2);
							}
						};
					};
				});
				break;
			case "what is this human's hair color?":
				playerHair = userAnswer;
				createCharacter(3);
				break;
			case "the human is wearing a jumpsuit. what color is it?":
				playerSuit = userAnswer;
				createCharacter(4);
				break;
			case "type the name of the character you want to play.":
				continuePlay(userAnswer);
				break;
			case "what side of the obelisk do you want to look at?":

				$.getJSON( 'items.json', function(data) {

					for (var i = 0; i <= data.length-1; i++) {

						if ( data[i].name == "obelisk" + userAnswer ) {

							response.append(responsePadding + "you see " + data[i].description + ".");
							image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });
							prompting = false;
							break;
						}

						else{

							if (i >= data.length-1) {

								response.append(responsePadding + "please indicate the side of the obelisk you want to see.");

								gamePrompt = "what side of the obelisk do you want to look at?";
								response.append(responsePadding + gamePrompt);	
								prompting = true;
							}
						};
					};
				});

				break;
			default:
				parseError(genericError);
		};

		input.val("");
	};

	function createCharacter (step) {

		prompting = true;

		switch (step){
			case 1:
				gamePrompt = "what is this human's name?";
				response.append(responsePadding + gamePrompt);
				break;
			case 2:
				gamePrompt = "what is this human's hair color?";
				response.append(responsePadding + gamePrompt);
				break;
			case 3:
				gamePrompt = "the human is wearing a jumpsuit. what color is it?";
				response.append(responsePadding + gamePrompt);
				break;
			case 4:
				response.append(responsePadding + "success. starting game now...");
				saveCharacter(playerName, playerHair, playerSuit);
				break;
			default:
				gamePrompt = "error: something went wrong during character creation. please refresh the browser window to restart.";
				response.append(responsePadding + gamePrompt);
				break;
		};
	};

	function saveCharacter (name, hair, suit) {

		var playerInfo = new Object();

		playerInfo.name = name;
		playerInfo.location = "obeliskhill";
		playerInfo.inventory = false;
		playerInfo.description = "a human with " + hair + " hair, wearing a " + suit + " jumpsuit.";
		playerInfo.trait = "human";
		playerInfo.player = false;

		$.ajax({
			type: "GET",
			dataType : 'json',
			async: false,
			url: '/xorx/newplayer.php',
			data: { data: JSON.stringify(playerInfo) },
			success: function () {
				prompting = true;
				gamePrompt = "type the name of the character you want to play.";
				response.append(responsePadding + gamePrompt);
			},
			failure: function() { response.append(responsePadding + "problem saving new character: server disrupted save process."); }
		});
	};

	function continuePlay (nameTest) {

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == nameTest ) {
					prompting = false;
					matchingCharacter = data[i].name;
					currentPlayer = matchingCharacter;
					startGame(currentPlayer);
					break;
				}

				else{

					if (i >= data.length-1) {
						response.append(responsePadding + "no character data found for " + nameTest + ".");

						gamePrompt = "type the name of the character you want to play.";
						response.append(responsePadding + gamePrompt);
					};

					prompting = true;
				};
			};
		});
	};

	function startGame (player) {

		getCurrentPlayerInfo(player);

		playerNameDisplay.html(currentPlayer);

		if (currentInventory) {
			inventory.html("<br>" + currentInventory);
		};

		trait.html("<br>" + currentTrait);

		displayCurrentLocation();	
	};

	function displayCurrentLocation () {

		$.getJSON( 'map.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if (data[i].name == currentLocation) {
					response.append(responsePadding + "you are at " + data[i].roomdescription + ".");
					image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });
					break;
				}

				else {

					if (i >= data.length-1) {

						response.append(responsePadding + "starting location error.");
					};
				};
			};
		});	
	}

	function getCurrentPlayerInfo (character) {

		$.ajax({
			url: 'characters.json',
			dataType: 'json',
			async: false,
			success: function(data) {

				for (var i = 0; i <= data.length; i++) {

					if ( data[i].name == character ) {

						currentPlayer = data[i].name;
						currentLocation = data[i].location;
						currentInventory = data[i].inventory;
						currentDescription = data[i].description;
						currentTrait = data[i].trait;

						break;
					};
				};
			}
		});

		// $.getJSON( 'characters.json', function(data) {

		// 	for (var i = 0; i <= data.length; i++) {

		// 		if ( data[i].name == character ) {

		// 			currentPlayer = data[i].name;
		// 			currentLocation = data[i].location;
		// 			currentInventory = data[i].inventory;
		// 			currentDescription = data[i].description;
		// 			currentTrait = data[i].trait;

		// 			break;
		// 		};
		// 	};
		// });
	};

	function help () {
		response.append(responsePadding + gameInstructions);
	};

	function parseError (errorMessage) {
		response.append(responsePadding + errorMessage);
	};

	function parseSubject (subject) {

		var subjectParse = "";

		switch (subject) {

			// characters
			case "xorxian":
			case "alien":
				subjectParse = "xia";
				break;
			case "flying":
			case "creature":
			case "bird":
				subjectParse = "xaph";
				break;
			case "demon":
			case "god":
				subjectParse = "xothrog";
				break;
			case "human":
			case "person":
				subjectParse = "human"; // FIX THIS LATER
				break;
			case "self":
			case currentPlayer:
				subjectParse = currentPlayer;
				break;

			// items
			case "stone":
			case "rock":
				subjectParse = "hotstone";
				break;
			case "gem":
			case "crystal":
			case "turquoise":
				subjectParse = "xorxgem";
				break;
			case "glint":
				subjectParse = "tower";
				break;
			case "portal":
			case "crystal":
				subjectParse = "portal";
				break;
			case "gun":
			case "rifle":
			case "ray":
			case "mind":
				subjectParse = "mindray";
				break;
			case "console":
			case "monitor":
			case "control":
			case "controls":
			case "controller":
			case "panel":
				subjectParse = "console";
				break;
			default:
				subjectParse = subject;
		};

		return subjectParse;
	}

	function look (subject) {

		var intendedSubject = parseSubject(subject);

		function lookSubjectTest () {

			var found = false;

			$.getJSON( 'characters.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].name == intendedSubject && data[i].location == currentLocation ) {

						response.append(responsePadding + "You see " + data[i].description + ".");
						found = true;
					};
				};
			});

			$.getJSON( 'items.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].name == intendedSubject) {

						if (data[i].location == currentLocation || data[i].location == currentPlayer) {

							response.append(responsePadding + "You see " + data[i].description + ".");
							image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });
							found = true;
						};
					}

					else if ( intendedSubject == "tower" || intendedSubject == "console" || intendedSubject == "obelisk") {

						found = true;

						switch (intendedSubject) {
							case "tower":
								response.append(responsePadding + "You see " + data[5].description + ".");
								image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });
								break;
							case "console":
								response.append(responsePadding + "You see " + data[12].description + ".");
								image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });
								break;
							case "obelisk":
								prompting = true;
								gamePrompt = "what side of the obelisk do you want to look at?";
								response.append(responsePadding + gamePrompt);
								break;
						};

						break;
					};
				};
			})
				.done( function() {

					if ( !found ) {

							response.append(responsePadding + "there is nothing more to see there.");
					};
				});
		};

		if (intendedSubject !== undefined) {

			lookSubjectTest();
		}

		else {

			var obeliskTest = "";

			var here = "";
			var north = "";
			var south = "";
			var east = "";
			var west = "";
			var above = "";
			var below = "";

			var locationItemArray = [];

			var locationCharacterArray = [];

			$.getJSON( 'map.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].name == currentLocation) {

						here = data[i].roomdescription;

						for (var n = 0; n <= data.length-1; n++) {

							if ( data[i].roomlocation.north == data[n].name) {
								north = data[n].roomdescription;
							};

							if ( data[i].roomlocation.south == data[n].name) {
								south = data[n].roomdescription;
							};

							if ( data[i].roomlocation.east == data[n].name) {
								east = data[n].roomdescription;
							};

							if ( data[i].roomlocation.west == data[n].name) {
								west = data[n].roomdescription;
							};

							if ( data[i].roomlocation.up == data[n].name) {
								above = data[n].roomdescription;
							};

							if ( data[i].roomlocation.down == data[n].name) {
								below = data[n].roomdescription;
							};
						};
					};
				};

				response.append(responsePadding + "here you see " + here + ". to the north there is " + north + ". to the south there is " + south + ". to the east there is " + east + ". to the west there is " + west + ". upwards there is " + above + ". downwards there is " + below + ".");
			});

			$.getJSON( 'items.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					obeliskTest = data[i].name.substring(0, 7);

					if ( data[i].location == currentLocation && obeliskTest != "obelisk") {

						locationItemArray.push(data[i].description);
					};
				};
			})
				.done( function() {

					if ( locationItemArray.length != 0 ) {

						for (var i = 0; i <= locationItemArray.length-1; i++) {

							response.append(responsePadding + "there is " + locationItemArray[i] + ".");
						};
					};
				});

			$.getJSON( 'characters.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].location == currentLocation && data[i].name != currentPlayer) {

						locationCharacterArray.push(data[i].description);
					};
				};
			})
				.done( function() {

					if ( locationCharacterArray.length != 0 ) {

						for (var i = 0; i <= locationCharacterArray.length-1; i++) {

							response.append(responsePadding + "there is " + locationCharacterArray[i] + ".");
						};
					};
				});
		};
	};

	function move (direction) {

		var newLocation = "";

		function setCurrentPlayerLocation(locationSet) {

			var locationDataString = "";

			locationDataString += "characters.json, ";
			locationDataString += currentPlayer + ", ";
			locationDataString += "location, ";
			locationDataString += locationSet;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: locationDataString },
				success: function () {
					getCurrentPlayerInfo(currentPlayer);
					displayCurrentLocation();
				},
				failure: function() { response.append(responsePadding + "problem moving character: server disrupted process."); }
			});
		};

		$.getJSON( 'map.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if (data[i].name == currentLocation) {

					switch (direction) {
						case "north":
							setCurrentPlayerLocation(data[i].roomlocation.north);
							break;
						case "south":
							setCurrentPlayerLocation(data[i].roomlocation.south);
							break;
						case "east":
							setCurrentPlayerLocation(data[i].roomlocation.east);
							break;
						case "west":
							setCurrentPlayerLocation(data[i].roomlocation.west);
							break;
						case "up":
							setCurrentPlayerLocation(data[i].roomlocation.up);
							break;
						case "down":
							setCurrentPlayerLocation(data[i].roomlocation.down);
							break;
					};

					break;
				}

				else {

					if (i >= data.length-1) {

						response.append(responsePadding + "movement error.");
					};
				};
			};
		});
	};

	function take (item) {

		var intendedItem = parseSubject(item);

		function setCurrentPlayerInventory(inventorySet) {

			var inventoryDataString = "";

			inventoryDataString += "characters.json, ";
			inventoryDataString += currentPlayer + ", ";
			inventoryDataString += "inventory, ";
			inventoryDataString += inventorySet;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: inventoryDataString },
				success: function () {

					getCurrentPlayerInfo(currentPlayer);

					inventory.html("<br>" + currentInventory);

					response.append(responsePadding + "you take the " + inventorySet + ".");
				},
				failure: function() { response.append(responsePadding + "problem taking item: server cannot access inventory."); }
			});
		};

		function setItemLocation (itemSet) {

			var itemDataString = "";

			itemDataString += "items.json, ";
			itemDataString += itemSet + ", ";
			itemDataString += "location, ";
			itemDataString += currentPlayer;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: itemDataString },
				success: function () {
				},
				failure: function() { response.append(responsePadding + "problem taking item: server cannot set item location."); }
			});
		};

		$.getJSON( 'items.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == intendedItem && data[i].location == currentLocation && data[i].movable ) {

					if (currentInventory) {

						response.append(responsePadding + "you are already carrying something.");
						break;
					} 

					else {

						setCurrentPlayerInventory(data[i].name);
						setItemLocation(data[i].name);
						break;
					};
				}

				else {

					if (i >= data.length-1) {

						response.append(responsePadding + "you can't take that.");
					};
				};
			};
		});
	};

	function drop () {

		function dropCurrentPlayerInventory() {

			var inventoryDataString = "";

			inventoryDataString += "characters.json, ";
			inventoryDataString += currentPlayer + ", ";
			inventoryDataString += "inventory, " + false;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: inventoryDataString },
				success: function () {

					response.append(responsePadding + "you drop the " + currentInventory + ".");

					getCurrentPlayerInfo(currentPlayer);

					if (currentInventory) {

						inventory.html("<br>" + currentInventory);
					}

					else{

						inventory.html("");
					};
				},
				failure: function() { response.append(responsePadding + "problem dropping item: server cannot access inventory."); }
			});
		};

		function dropItemLocation (item) {

			var itemDataString = "";

			itemDataString += "items.json, ";
			itemDataString += item + ", ";
			itemDataString += "location, ";
			itemDataString += currentLocation;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: itemDataString },
				success: function () {
				},
				failure: function() { response.append(responsePadding + "problem dropping item: server cannot set item location."); }
			});
		};

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == currentPlayer ) {

					if ( data[i].inventory ) {

						dropCurrentPlayerInventory();
						dropItemLocation(data[i].inventory);
						break;
					} 

					else {

						response.append(responsePadding + "you are not carrying anything.");
						break;
					};
				};
			};
		});
	};

	function give (subject1, subject2) {

		var intendedSubject1 = parseSubject(subject1);
		var intendedSubject2 = parseSubject(subject2);

		var givenRecipient = "";
		var givenItem = currentInventory;

		function giveCurrentPlayerInventory() {

			var givePlayerDataString = "";

			givePlayerDataString += "characters.json, ";
			givePlayerDataString += currentPlayer + ", ";
			givePlayerDataString += "inventory, " + false;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: givePlayerDataString },
				success: function () {

					switch (givenRecipient) {

						// characters
						case "xia":
							givenRecipientParse = "the xorxian";
							break;
						case "xaph":
							givenRecipientParse = "the flying creature";
							break;
						case "xothrog":
							givenRecipientParse = "the demon god";
							break;
						default:
							givenRecipientParse = givenRecipient;
					};

					response.append(responsePadding + "you give the " + currentInventory + " to " + givenRecipientParse + ".");

					getCurrentPlayerInfo(currentPlayer);

					if (currentInventory) {

						inventory.html("<br>" + currentInventory);
					}

					else{

						inventory.html("");
					};
				},
				failure: function() { response.append(responsePadding + "problem giving item: server cannot access player inventory."); }
			});
		};

		function giveRecipientInventory(recipient) {

			var giveRecipientDataString = "";

			giveRecipientDataString += "characters.json, ";
			giveRecipientDataString += recipient + ", ";
			giveRecipientDataString += "inventory, ";
			giveRecipientDataString += givenItem;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: giveRecipientDataString },
				success: function () {},
				failure: function() { response.append(responsePadding + "problem giving item: server cannot access recipient inventory."); }
			});
		};

		function giveItemLocation (recipient) {

			var itemDataString = "";

			itemDataString += "items.json, ";
			itemDataString += givenItem + ", ";
			itemDataString += "location, ";
			itemDataString += recipient;

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: itemDataString },
				success: function () {},
				failure: function() { response.append(responsePadding + "problem giving item: server cannot set item location."); }
			});
		};

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].location == currentLocation ) {

					if (data[i].name == intendedSubject1 || data[i].name == intendedSubject2) {

						if (data[i].inventory) {

							response.append(responsePadding + "that character is already holding something.");
							break;
						}

						else {

							givenRecipient = data[i].name;
							break;
						};
					} 

					else{

						if (i >= data.length-1) {

							response.append(responsePadding + "please include a valid character to give to.");
							break;
						};
					};
				};
			};
		})

			.done( function() {

				if (givenRecipient.length > 2) {

					if (givenRecipient != "xaph") {
						giveCurrentPlayerInventory();
						giveRecipientInventory(givenRecipient);
						giveItemLocation(givenRecipient);
					} 

					else {
						response.append(responsePadding + "he has no interest in that.");
					};
				} 

				else{

					response.append(responsePadding + "could not give the item.");
				};
			});
	};

});