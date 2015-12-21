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
	var gameInstructions = "you are a human mysteriously trapped on a strange alien world. is there a way back home? or maybe there is an amazing discovery to be made here...<br>basic instructions: type in the box to control your character. everything you type MUST be lower case. examples: 'take rock', 'look rock', 'go west'. the game saves progress automatically whenever a command is given. if something seems broken or you have any suggestions, please email the developer at jesse@jdillman.com<br>keep in mind that there is more to this game than it may seem at first. :)";

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

			if ( userCommandArray[i]=="at" || userCommandArray[i]=="a" || userCommandArray[i]=="the" || userCommandArray[i]=="an" || userCommandArray[i]=="with" || userCommandArray[i]=="using" || userCommandArray[i]=="to" || userCommandArray[i]=="out" || userCommandArray[i]=="in" || userCommandArray[i]=="into" || userCommandArray[i]=="through" ) {
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
			case "talk":
				greet(subject1, subject2); //done
				break;
			case "read":
			case "decipher":
				read(subject1); //done
				break;
			case "give":
			case "hand":
			case "offer":
				give(subject1, subject2); //done
				break;
			case "take":
			case "get":
				take(subject1); //done
				break;
			case "drop":
				drop(); //done
				break;
			case "activate":
			case "shoot":
			case "operate":
			case "put":
			case "place":
			case "use":
				activate(subject1, subject2);
				break;
			case "go":
			case "walk":
			case "move":
			case "travel":
			case "enter":
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

						if ( data[i].name == "obelisk_" + userAnswer ) {

							response.append(responsePadding + "you see " + data[i].description + ".");
							image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });
							prompting = false;
							break;
						}

						else{

							if (i >= data.length-1) {

								response.append(responsePadding + "please indicate the side of the obelisk you want to see (north, south, east, or west).");

								gamePrompt = "what side of the obelisk do you want to look at?";
								response.append(responsePadding + gamePrompt);	
								prompting = true;
							}
						};
					};
				});

				break;
			case "who do you want to talk to?":

				$.getJSON( 'characters.json', function(data) {

					if (userAnswer.substring(0, 4) == "the ") {

						userAnswer = userAnswer.substring(4);
					};

					var intendedCharacter = parseSubject(userAnswer);

					for (var i = 0; i <= data.length-1; i++) {

						if ( data[i].name == intendedCharacter ) {

							prompting = false;
							greet(intendedCharacter);
							break;
						}

						else{

							if (i >= data.length-1) {

								prompting = false;
								response.append(responsePadding + "you can't talk to that.");
								break;
							}
						};
					};
				});

				break;
			case "what do you want to fire the mindray at?":

				$.getJSON( 'characters.json', function(data) {

					if (userAnswer.substring(0, 4) == "the ") {

						userAnswer = userAnswer.substring(4);
					};

					var intendedCharacter = parseSubject(userAnswer);

					for (var i = 0; i <= data.length-1; i++) {

						if (data[i].name == intendedCharacter && data[i].location == currentLocation) {

							switch (data[i].name){
								case "xia":
									response.append(responsePadding + "a stream of electricity flashes from the mindray and strikes the xorxian.");
									response.append(responsePadding + "he clutches his head in pain for a moment but quickly recovers. it seems like that was completely unnecessary.");
									break;
								case "xaph":
									response.append(responsePadding + "a stream of electricity flashes from the mindray and strikes the flying creature.");
									response.append(responsePadding + "it writhes in pain for a moment but quickly recovers. it seems like that was completely unnecessary.");
									break;
								case "xothrog":
									response.append(responsePadding + "a stream of electricity flashes from the mindray and strikes xothrog.");
									xothrogTrigger();
									break;
								default:
									response.append(responsePadding + "a stream of electricity flashes from the mindray and strikes " + data[i].name + ".");
									response.append(responsePadding + "he clutches his head in pain for a moment but quickly recovers. it seems like that was completely unnecessary.");
									break;
							};
							break;
						}

						else{

							if (i >= data.length-1) {

								prompting = false;
								response.append(responsePadding + "you can't shoot at that.");
								break;
							}
						};
					};
				});

				break;
			case "what side of the obelisk do you want to read?":

				$.getJSON( 'items.json', function(data) {

					for (var i = 0; i <= data.length-1; i++) {

						if ( data[i].name == "obelisk_" + userAnswer ) {

							image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });

							if (currentTrait == "xorxian") {

								response.append(responsePadding + data[i].translation + ".");
							} 

							else {

								response.append(responsePadding + "you cannot decipher these xorxian runes.");
							};
							
							prompting = false;
							break;
						}

						else {

							if (i >= data.length-1) {

								response.append(responsePadding + "please indicate the side of the obelisk you want to read (north, south, east, or west).");

								gamePrompt = "what side of the obelisk do you want to read?";
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
	};

	function help () {
		response.append(responsePadding + gameInstructions);
	};

	function parseError (errorMessage) {
		response.append(responsePadding + errorMessage);
	};

	function parseSubject (subject) {

		var subjectParse = "";
		var testLocation = currentLocation.indexOf(".");

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
			case "tower":

				if (testLocation > 0) {

					var targetLocation = currentLocation.split(".");
					subjectParse = "tower_" + targetLocation[1];
				}

				else {

					subjectParse = subject;
				};
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
			case "wall":
				subjectParse = "inscription";
				break;
			case "console":
			case "monitor":
			case "control":
			case "controls":
			case "controller":
			case "depression":
			case "panel":

				if (testLocation > 0) {

					var targetLocation = currentLocation.split(".");
					subjectParse = "console_" + targetLocation[1];
				}

				else {

					subjectParse = subject;
				};
				break;
			default:
				subjectParse = subject;
				break;
		};

		console.log(subjectParse);
		return subjectParse;
	};

	function look (subject) {

		var intendedSubject = parseSubject(subject);

		function lookSubjectTest () {

			var found = false;

			if (intendedSubject == "obelisk" && currentLocation == "obeliskhill") {

				prompting = true;
				gamePrompt = "what side of the obelisk do you want to look at?";
				response.append(responsePadding + gamePrompt);
				return;
			};

			$.getJSON( 'characters.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].name == intendedSubject && data[i].location == currentLocation ) {

						if (data[i].name == "xia" && data[i].inventory == "scroll") {

							scrollTrigger();
						};

						response.append(responsePadding + "you see " + data[i].description + ".");
						found = true;
					};
				};
			});

			$.getJSON( 'items.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].name == intendedSubject) {

						if (data[i].location == currentLocation || data[i].location == currentPlayer) {

							response.append(responsePadding + "you see " + data[i].description + ".");
							image.css({ "background-image" : "url('images/" + data[i].name + ".png')" });
							found = true;
						};
					}
				};
			})
				.done( function() {

					if ( !found ) {

							response.append(responsePadding + "there is nothing more to see there.");
							look();
					};
				});
		};

		if (intendedSubject !== undefined) {

			lookSubjectTest();
		}

		else {

			var obeliskTest = "";

			var lookData = [];
			var lookDataIndex = 0;
			var lookDataString = "";

			var locationItemArray = [];
			var locationCharacterArray = [];

			$.getJSON( 'map.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].name == currentLocation) {

						lookData.push({"name":"here", "text": data[i].roomdescription});

						for (var n = 0; n <= data.length-1; n++) {

							if ( data[i].roomlocation.north && data[i].roomlocation.north == data[n].name) {
								lookData.push({"name":"north", "text": data[n].roomdescription});
							};

							if ( data[i].roomlocation.south && data[i].roomlocation.south == data[n].name) {
								lookData.push({"name":"south", "text": data[n].roomdescription});
							};

							if ( data[i].roomlocation.east && data[i].roomlocation.east == data[n].name) {
								lookData.push({"name":"east", "text": data[n].roomdescription});
							};

							if ( data[i].roomlocation.west && data[i].roomlocation.west == data[n].name) {
								lookData.push({"name":"west", "text": data[n].roomdescription});
							};

							if ( data[i].roomlocation.up && data[i].roomlocation.up == data[n].name) {
								lookData.push({"name":"up", "text": data[n].roomdescription});
							};

							if ( data[i].roomlocation.down && data[i].roomlocation.down == data[n].name) {
								lookData.push({"name":"down", "text": data[n].roomdescription});
							};
						};
					};
				};

				for (var i = 0; i <= lookData.length-1; i++) {

					lookDataString += lookData[i].name + " you see " + lookData[i].text + ". ";
				};

				response.append(responsePadding + lookDataString);
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

						if (data[i].name != currentPlayer && data[i].name == "xia" && data[i].inventory == "scroll") {

							scrollTrigger();
						};

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
							if (data[i].roomlocation.north) {
								setCurrentPlayerLocation(data[i].roomlocation.north);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "south":

							console.log(data[i].roomlocation.south);

							if (data[i].roomlocation.south) {
								setCurrentPlayerLocation(data[i].roomlocation.south);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "east":
							if (data[i].roomlocation.east) {
								setCurrentPlayerLocation(data[i].roomlocation.east);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "west":
							if (data[i].roomlocation.west) {
								setCurrentPlayerLocation(data[i].roomlocation.west);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "up":
							if (data[i].roomlocation.up) {

								if (currentTrait == "flying" || currentLocation == "underground.northeast" || currentLocation == "butteinterior") {
									setCurrentPlayerLocation(data[i].roomlocation.up);
								} 

								else{

									response.append(responsePadding + "you are not able to fly.");
								};
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "down":
						case "door":
							if (data[i].roomlocation.down) {
								setCurrentPlayerLocation(data[i].roomlocation.down);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						default:
							response.append(responsePadding + "that is not a valid direction.");
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

					if (currentInventory == "hotstone" && givenRecipient == "xia") {

						xiaTrigger();
					};

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

	function greet (subject1, subject2) {

		var intendedSubject1 = parseSubject(subject1);
		var intendedSubject2 = parseSubject(subject2);

		var understanding = true;

		$.getJSON( 'characters.json', function(data) {

			parent:
			for (var i = 0; i <= data.length-1; i++) {

				if (data[i].name == intendedSubject1 || data[i].name == intendedSubject2) {

					if ( data[i].location == currentLocation ) {

						if (data[i].trait != currentTrait) {

							response.append(responsePadding + "he does not understand your language.");
							understanding = false;
						};

						switch (data[i].name) {
							case "xia":

								if (data[i].inventory == "hotstone") {
									response.append(responsePadding + "the xorxian gestures to himself and says \"xia\".");
								} 

								else {
									response.append(responsePadding + "the xorxian does not respond, but continues watching you closely.");
								};
								break parent;
							case "xaph":
								response.append(responsePadding + "the flying creature does not seem capable of conversation.");
								break parent;
							case "xothrog":
								response.append(responsePadding + "xothrog does not seem interested in conversation.");
								break parent;
							default:

								if (understanding) {

									response.append(responsePadding + "the human responds, \"greetings friend, my name is " + data[i].name + "\".");
								} 

								else{

									response.append(responsePadding + "the human gives no response.");
								};
								break parent;
						};
					}

					else{

						response.append(responsePadding + "you can't talk to that character here.");
						break parent;
					};
				}

				else{

					if (i >= data.length-1) {

						console.log("from name test");

						gamePrompt = "who do you want to talk to?";
						response.append(responsePadding + gamePrompt);	
						prompting = true;
						break;
					};
				};
			};
		});
	};

	function read (subject) {

		var intendedSubject = parseSubject(subject);

		if (intendedSubject == "runes" || intendedSubject === undefined) {

			response.append(responsePadding + "try reading with the name of the object.");
			return;
		};

		if (intendedSubject == "obelisk" && currentLocation == "obeliskhill") {

			prompting = true;
			gamePrompt = "what side of the obelisk do you want to read?";
			response.append(responsePadding + gamePrompt);
			return;
		};
		
		$.getJSON( 'items.json', function(data) {

			parent:
			for (var i = 0; i <= data.length-1; i++) {

				if (data[i].name == intendedSubject) {

					if ( data[i].location == currentLocation || data[i].location == currentPlayer ) {

						switch (intendedSubject) {
							case "scroll":
								image.css({ "background-image" : "url('images/scroll.png')" });

								if (currentTrait == "xorxian") {

									response.append(responsePadding + data[i].translation + ".");
								} 

								else{
									response.append(responsePadding + "you cannot decipher these xorxian runes.");
								};
								break parent;
							case "inscription":
								image.css({ "background-image" : "url('images/inscription.png')" });
								response.append(responsePadding + "you stoop down and read the inscription.");

								if (currentTrait == "human") {

									response.append(responsePadding + "it says, " + data[i].translation + ".");
								} 

								else{

									response.append(responsePadding + "you cannot decipher these human runes.");
								};

								break parent;
							default:
								response.append(responsePadding + "there is nothing to read on that.");
								break parent;
						};
					}

					else{

						response.append(responsePadding + "you can't read that here.");
						break parent;
					};
				}

				else{

					if (i >= data.length-1) {

						response.append(responsePadding + "you can't read that.");
						break;
					};
				};
			};
		});
	};

	function activate (subject1, subject2) {

		var intendedSubject1 = parseSubject(subject1);
		var intendedSubject2 = parseSubject(subject2);
		var useParse = "";

		$.getJSON( 'items.json', function(data) {

			parent:
			for (var i = 0; i <= data.length-1; i++) {

				if (data[i].name == intendedSubject1 || data[i].name == intendedSubject2) {

					if (data[i].location == currentLocation || data[i].location == currentPlayer) {

						if (data[i].name.substring(0, 7) == "console") {

							useParse = "console";
						} 

						else{

							useParse = data[i].name;
						};

						switch (useParse) {
							case "portal":
								portalTrigger();
								break parent;
							case "mindray":
								prompting = true;
								gamePrompt = "what do you want to fire the mindray at?";
								response.append(responsePadding + gamePrompt);
								break parent;
							case "scroll":
								read("scroll");
								break parent;
							case "xorxgem":
								if (currentTrait == "immortal") {
									response.append(responsePadding + "you can use your immortal power to produce a beam of energy from the gem.");
									gemTrigger();
								} 
								else {
									response.append(responsePadding + "it seems like this xorxian artifact would require immortal power to operate.");
								};
								break parent;
							case "console":
								if (currentTrait == "human") {
									var orientation = data[i].name.split("_");
									response.append(responsePadding + "you place your hand into the console.");
									towerTrigger(orientation[1]);
								} 
								else {
									response.append(responsePadding + "you are not capable of operating this human technology.");
								};
								break parent;
							default:
								response.append(responsePadding + "you see no way to operate that.");
								break parent;
						};
					}

					else{

						response.append(responsePadding + "you can't use that here.");
						break parent;
					};
				}

				else{

					if (i >= data.length-1) {

						response.append(responsePadding + "you can't use that.");
						break;
					};
				};
			};
		});
	};

	// Special Triggers:

	// scrollTrigger - destroy scroll item/remove scroll from xia inventory
	// xiaTrigger - open underground/xia gives his name
	// towerTrigger - console activates tower for 4 turns
	// portalTrigger - tower activations set state of portal
	// butteTrigger - open butteinterior when key is used on door
	// humanTrigger - destroy a human if there are 3, increase xothrogtrigger counter, and drop his inventory at xothroggrave
	// xothrogTrigger - set xothrog's location to xothroggrave and start his AI
	// gemTrigger - set final state of portal if location and direction are right

	function scrollTrigger () {

		var setScrollDataString = "";

		setScrollDataString += "items.json, ";
		setScrollDataString += "scroll, ";
		setScrollDataString += "location, ";
		setScrollDataString += "sealed";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setScrollDataString },
			success: function () {

				response.append(responsePadding + "the xorxian notices you and raises the scroll in his hand. he waves his free hand around the scroll.");
			},
			failure: function() { response.append(responsePadding + "problem triggering xorxian event: server cannot access scroll item."); }
		});

		var setInvDataString = "";

		setInvDataString += "characters.json, ";
		setInvDataString += "xia, ";
		setInvDataString += "inventory, " + false;

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setInvDataString },
			success: function () {

				response.append(responsePadding + "with a wave of the xorxian's hand, the scroll vanishes into thin air.");
			},
			failure: function() { response.append(responsePadding + "problem triggering xorxian event: server cannot access xorxian inventory."); }
		});
	};

	function xiaTrigger () {
	
		var setDescDataString = "";

		setDescDataString += "map.json, ";
		setDescDataString += "xiascave, ";
		setDescDataString += "roomdescription, ";
		setDescDataString += "a small, well-lit cave. there is a large dark opening in the back of the cave";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setDescDataString },
			success: function () {

				response.append(responsePadding + "the xorxian takes the stone and places it into a slot in the wall you hadn't noticed. suddenly lights spring to life and a comfortable warmth fills the cave.");
			},
			failure: function() { response.append(responsePadding + "problem triggering xorxian event: server cannot access map description."); }
		});

		var setDownDataString = "";

		setDownDataString += "map.json, ";
		setDownDataString += "xiascave, ";
		setDownDataString += "roomlocation, ";
		setDownDataString += '{"north":"ocean","south":"tower.east","east":"ocean","west":"tower.north","up":"sky","down":"underground.northeast"}';

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setDownDataString },
			success: function () {

				response.append(responsePadding + "the large metal door in the back of the cave slides open.");
			},
			failure: function() { response.append(responsePadding + "problem triggering xiascave event: server cannot access map location."); }
		});

		var setXiaDataString = "";

		setXiaDataString += "characters.json, ";
		setXiaDataString += "xia, ";
		setXiaDataString += "description, ";
		setXiaDataString += "a very short, purple-skinned xorxian with a small eyes in a flat face and four-fingered hands.";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setXiaDataString },
			success: function () {

				response.append(responsePadding + "the xorxian seems pleased. he looks at you, gestures to himself and says \"xia\".");
			},
			failure: function() { response.append(responsePadding + "problem triggering xia event: server cannot access xorxian description."); }
		});
	};

});