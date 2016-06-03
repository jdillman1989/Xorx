// towers not powering down

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
	var currentXothrogLevel = 0;
	var currentXothrogLocation = "";

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
							break;	
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
									mindrayTrigger();
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
			case "the world of xorx can only sustain three humans at any given time. to create a new character, you must sacrifice an existing human. type the name of the human you wish to sacrifice.":

				$.getJSON( 'characters.json', function(data) {

					for (var i = 0; i <= data.length-1; i++) {

						if ( data[i].name == userAnswer && data[i].trait == 'human' ) {

							prompting = false;
							humanTrigger(data[i].name);
							break;
						}

						else{

							if (i >= data.length-1) {

								prompting = false;
								response.append(responsePadding + "that is not a valid character for sacrifice.");
								response.append(responsePadding + "type new to start a new character. type continue to play an existing character.");
								break;
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
				$.getJSON( 'characters.json', function(data) {

					if (data.length > 5) {
						gamePrompt = "the world of xorx can only sustain three humans at any given time. to create a new character, you must sacrifice an existing human. type the name of the human you wish to sacrifice.";
						response.append(responsePadding + gamePrompt);
						prompting = true;
					}
					else{
						gamePrompt = "what is this human's name?";
						response.append(responsePadding + gamePrompt);
					};
				});
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
		playerInfo.player = 0;

		$.ajax({
			type: "GET",
			dataType : 'json',
			async: false,
			url: '/xorx/addproperty.php',
			data: { data: JSON.stringify(playerInfo) },
			complete: function () {
				prompting = true;
				gamePrompt = "type the name of the character you want to play.";
				response.append(responsePadding + gamePrompt);
			},
			failure: function() {
				response.append(responsePadding + "problem saving new character: server disrupted save process.");
			}
		});
	};

	function continuePlay (nameTest) {

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == nameTest ) {

					if (data[i].name == "xothrog" && data[i].player > 2) {
						response.append(responsePadding + "the demon god's willpower resists your influence.");

						gamePrompt = "type the name of the character you want to play.";
						response.append(responsePadding + gamePrompt);
					} 

					else{
						prompting = false;
						matchingCharacter = data[i].name;
						currentPlayer = matchingCharacter;
						startGame(currentPlayer);
						break;
					};
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

			locationDataString += "characters.json& ";
			locationDataString += currentPlayer + "& ";
			locationDataString += "location& ";
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
							if (data[i].roomlocation.north && data[i].roomlocation.north != "ocean") {
								setCurrentPlayerLocation(data[i].roomlocation.north);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "south":
							if (data[i].roomlocation.south && data[i].roomlocation.south != "ocean") {
								setCurrentPlayerLocation(data[i].roomlocation.south);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "east":
							if (data[i].roomlocation.east && data[i].roomlocation.east != "ocean") {
								setCurrentPlayerLocation(data[i].roomlocation.east);
							} 

							else {
								response.append(responsePadding + "you can't go that way.");
							};
							break;
						case "west":
							if (data[i].roomlocation.west && data[i].roomlocation.west != "ocean") {
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

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == "xothrog" ) {
					currentXothrogLevel = parseInt(data[i].player);
					currentXothrogLocation = data[i].location;
					break;
				}
			};
		})
			.done( function() {

				if (currentXothrogLevel >= 2 && currentXothrogLocation != currentLocation) {
					xothrogAI();
				}
			});

		$.getJSON( 'items.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				var towerTest = data[i].name.split("_");

				console.log(towerTest);

				if (towerTest == "tower") {

					console.log(data[i].active);

					if (data[i].active > 0) {

						var towerLevel = data[i].active - 1;

						decreaseTowerActivation(data[i].name, towerLevel);
					};
				};
			};
		});
	};

	function take (item) {

		var intendedItem = parseSubject(item);

		function setCurrentPlayerInventory(inventorySet) {

			var inventoryDataString = "";

			inventoryDataString += "characters.json& ";
			inventoryDataString += currentPlayer + "& ";
			inventoryDataString += "inventory& ";
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

			itemDataString += "items.json& ";
			itemDataString += itemSet + "& ";
			itemDataString += "location& ";
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

			inventoryDataString += "characters.json& ";
			inventoryDataString += currentPlayer + "& ";
			inventoryDataString += "inventory& " + false;

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

			itemDataString += "items.json& ";
			itemDataString += item + "& ";
			itemDataString += "location& ";
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

			givePlayerDataString += "characters.json& ";
			givePlayerDataString += currentPlayer + "& ";
			givePlayerDataString += "inventory& " + false;

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

			giveRecipientDataString += "characters.json& ";
			giveRecipientDataString += recipient + "& ";
			giveRecipientDataString += "inventory& ";
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

			itemDataString += "items.json& ";
			itemDataString += givenItem + "& ";
			itemDataString += "location& ";
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
							case "buttekey":
								butteTrigger();
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
		// towerTrigger - console activates tower for 4 turns and checks for portal activation
		// portalTrigger - tower activations set state of portal
		// endGame - show ending splash screen when active portal is used
		// butteTrigger - open butteinterior when key is used on door
		// humanTrigger - destroy a human if there are 3, increase xothrogtrigger counter, and drop his inventory at xothroggrave
		// xothrogTrigger - set xothrog's location to xothroggrave and start his AI
		// mindrayTrigger - stop xothrog's AI
	// gemTrigger - set final state of portal if location and direction are right
	// omniscience - set player trait to omniscient and trigger it

	function scrollTrigger () {

		var setScrollDataString = "";

		setScrollDataString += "items.json& ";
		setScrollDataString += "scroll& ";
		setScrollDataString += "location& ";
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

		setInvDataString += "characters.json& ";
		setInvDataString += "xia& ";
		setInvDataString += "inventory& " + false;

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

		setDescDataString += "map.json& ";
		setDescDataString += "xiascave& ";
		setDescDataString += "roomdescription& ";
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

		setDownDataString += "map.json& ";
		setDownDataString += "xiascave& ";
		setDownDataString += "roomlocation& ";
		setDownDataString += "down> underground.northeast";

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

		setXiaDataString += "characters.json& ";
		setXiaDataString += "xia& ";
		setXiaDataString += "description& ";
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

	function towerTrigger (position) {
	
		var setTowerDataString = "";

		setTowerDataString += "items.json& ";
		setTowerDataString += "tower_" + position + "& ";
		setTowerDataString += "active& ";
		setTowerDataString += "4";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setTowerDataString },
			success: function () {

				response.append(responsePadding + "you hear a deep rumbling sound coming from above. the monitor shows a beam of light emitting from the top of the tower.");
			},
			failure: function() { response.append(responsePadding + "problem triggering tower event: server cannot access item properties."); }
		});

		var towersActivated = 0;

		$.getJSON( 'items.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				var towerTest = data[i].name.split("_");

				if (towerTest == "tower") {

					if (data[i].active > 0) {
						towersActivated++;
					};
				};
			};
		})
			.done( function() {

				if (towersActivated == 3) {

					var setPortalDataString = "";

					setPortalDataString += "items.json& ";
					setPortalDataString += "portal& ";
					setPortalDataString += "active& ";
					setPortalDataString += "1";

					$.ajax({
						type: "GET",
						dataType : 'text',
						url: '/xorx/setproperty.php',
						data: { data: setPortalDataString },
						success: function () {

							response.append(responsePadding + "you feel a powerful aura expanding from the center of the island.");
						},
						failure: function() { response.append(responsePadding + "problem triggering portal event: server cannot access item properties."); }
					});

					var setCrystalDataString = "";

					setCrystalDataString += "items.json& ";
					setCrystalDataString += "portal& ";
					setCrystalDataString += "description& ";
					setCrystalDataString += "an enormous brightly shining crystalline structure. a powerful aura flows from it";

					$.ajax({
						type: "GET",
						dataType : 'text',
						url: '/xorx/setproperty.php',
						data: { data: setCrystalDataString },
						success: function () {},
						failure: function() { response.append(responsePadding + "problem triggering portal event: server cannot access item properties."); }
					});
				};
			});
	};

	function decreaseTowerActivation (tower, level) {

		console.log("Tower: " + tower + ", Level: " + level);

		var setActiveDataString = "";

		setActiveDataString += "items.json& " + tower + "& ";
		setActiveDataString += "active& " + level;

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setActiveDataString },
			success: function () {

				console.log("success");

				if (level == 0) {
					response.append(responsePadding + "you hear a far off sound of something powering down.");
				};
			},
			failure: function() { response.append(responsePadding + "problem triggering tower event: server cannot access item properties."); }
		});
	};

	function portalTrigger () {

		$.getJSON( 'items.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if (data[i].name == "portal") {

					switch (data[i].active) {
						case 0:
							response.append(responsePadding + "the crystal feels icy cold on your hand.");
							break;
						case 1:
							response.append(responsePadding + "the crystal's power practically pulls you towards it. you place your hand on it's hot surface and embrace a wave of light rushing over you. you feel your body being whisked away.");

							setTimeout(endGame, 6000);
							break;
						case 2:
							response.append(responsePadding + "the crystal's power practically pulls you towards it. you place your hand on it's hot surface and embrace a wave of light rushing over you. you feel your consciousness expanding.");

							setTimeout(omniscience, 6000);
							break;
						default:
							response.append(responsePadding + "something is wrong with this, there is a problem with your save.");
							break;
					};
				};
			};
		});
	};

	function endGame () {

		var setEndDataString = "";

		setEndDataString += "characters.json& " + currentPlayer;

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/removeproperty.php',
			data: { data: setEndDataString },
			success: function () {

				$("#endgame").append("<div><h1>congratulations</h1><p>your character was able to make it back to earth. but there was something they missed on xorx. maybe you will find more information about this strange world next time you play.</p></div>");

				$("#endgame").fadeIn();
			},
			failure: function() { response.append(responsePadding + "problem triggering portal event: server cannot access item properties."); }
		});

		if (currentInventory) {
			var setDropDataString = "";

			setDropDataString += "items.json& ";
			setDropDataString += currentInventory + "& ";
			setDropDataString += "location& ";
			setDropDataString += "pyramid";

			$.ajax({
				type: "GET",
				dataType : 'text',
				url: '/xorx/setproperty.php',
				data: { data: setDropDataString },
				success: function () {},
				failure: function() { response.append(responsePadding + "problem triggering portal event: server cannot access item properties."); }
			});
		};
	};

	function butteTrigger () {

		var setButteDataString = "";

		setButteDataString += "map.json& ";
		setButteDataString += "butte& ";
		setButteDataString += "roomlocation& ";
		setButteDataString += "down> butteinterior";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setButteDataString },
			success: function () {

				response.append(responsePadding + "the sealed door in the base of the butte slides open.");
			},
			failure: function() { response.append(responsePadding + "problem triggering butte event: server cannot access map location."); }
		});

		var setDescDataString = "";

		setDescDataString += "map.json& ";
		setDescDataString += "butte& ";
		setDescDataString += "roomdescription& ";
		setDescDataString += "a tall steep butte with a large nest at its peak and an open door in its base";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setDescDataString },
			success: function () {},
			failure: function() { response.append(responsePadding + "problem triggering butte event: server cannot access map description."); }
		});
	};

	function humanTrigger (sacrifice) {

		var inventoryToGrave = false;

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == sacrifice && data[i].trait == "human" ) {
					inventoryToGrave = data[i].inventory;
					break;
				}
			};
		})
			.done( function() {
				if (inventoryToGrave) {
					var setInvDataString = "";

					setInvDataString += "items.json& ";
					setInvDataString += inventoryToGrave + "& ";
					setInvDataString += "location& ";
					setInvDataString += "xothroggrave";

					$.ajax({
						type: "GET",
						dataType : 'text',
						url: '/xorx/setproperty.php',
						data: { data: setInvDataString },
						success: function () {
						},
						failure: function() { response.append(responsePadding + "problem triggering sacrifice event: server cannot access inventory data."); }
					});
				};
			});		

		var setSacrificeDataString = "";

		setSacrificeDataString += "characters.json& " + sacrifice;

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/removeproperty.php',
			data: { data: setSacrificeDataString },
			success: function () {

				response.append(responsePadding + "you have sacrificed " + sacrifice + " to the demon god xothrog.");
				response.append(responsePadding + "type new to start a new character. type continue to play an existing character.");
			},
			failure: function() { response.append(responsePadding + "problem triggering sacrifice event: server cannot access character data."); }
		});

		var xothrogLevel = 0;

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == "xothrog" ) {
					xothrogLevel = parseInt(data[i].player) + 1;
					break;
				}
			};
		})
			.done( function() {

				if (xothrogLevel > 2) {
					xothrogTrigger();
				} 

				else{
					var setXothrogDataString = "";

					setXothrogDataString += "characters.json& ";
					setXothrogDataString += "xothrog& ";
					setXothrogDataString += "player& " + xothrogLevel;

					$.ajax({
						type: "GET",
						dataType : 'text',
						url: '/xorx/setproperty.php',
						data: { data: setXothrogDataString },
						success: function () {
						},
						failure: function() { response.append(responsePadding + "problem triggering sacrifice event: server cannot access xothrog data."); }
					});
				};
			});	
	};

	function xothrogTrigger () {

		var setXothrogDataString = "";

		setXothrogDataString += "characters.json& ";
		setXothrogDataString += "xothrog& ";
		setXothrogDataString += "location& ";
		setXothrogDataString += "xothroggrave";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setXothrogDataString },
			success: function () {

				response.append(responsePadding + "the demon god xothrog has awoken.");
			},
			failure: function() { response.append(responsePadding + "problem triggering xothrog event: server cannot access character location."); }
		});
	};

	function xothrogAI () {

		var moveNumber = Math.floor(Math.random() * 5) + 1;

		$.getJSON( 'characters.json', function(data) {

			var currentXothrogLocation = "";

			for (var i = 0; i <= data.length-1; i++) {

				if ( data[i].name == "xothrog" ) {
					currentXothrogLocation = data[i].location;
				};
			};
		})

			.done( function() {

				var newXothrogLocation = "";

				var xothrogDirection = "";

				$.getJSON( 'map.json', function(data) {

					for (var i = 0; i <= data.length-1; i++) {

						if ( data[i].name == currentXothrogLocation ) {
							switch (moveNumber) {
								case 1:
									newXothrogLocation = data[i].roomlocation.north;
									xothrogDirection = "north";
									break;
								case 2:
									newXothrogLocation = data[i].roomlocation.south;
									xothrogDirection = "south";
									break;
								case 3:
									newXothrogLocation = data[i].roomlocation.east;
									xothrogDirection = "east";
									break;
								case 4:
									newXothrogLocation = data[i].roomlocation.west;
									xothrogDirection = "west";
									break;
								case 5:
									newXothrogLocation = currentXothrogLocation;
									xothrogDirection = false;
									break;
							};
						};
					};

					if (newXothrogLocation == "ocean") {
						newXothrogLocation = currentXothrogLocation;
						xothrogDirection = false;
					};
				})

					.done( function() {

						var setAIDataString = "";

						setAIDataString += "characters.json& ";
						setAIDataString += "xothrog& ";
						setAIDataString += "location& ";
						setAIDataString += newXothrogLocation;

						$.ajax({
							type: "GET",
							dataType : 'text',
							url: '/xorx/setproperty.php',
							data: { data: setAIDataString },
							success: function () {

								if (xothrogDirection) {
									response.append(responsePadding + "the demon god xothrog moves " + xothrogDirection + ".");
								};
							},
							failure: function() { response.append(responsePadding + "problem triggering xothrog event: server cannot access character location."); }
						});
					});
			});
	};

	function mindrayTrigger () {
		var setLevelDataString = "";

		setLevelDataString += "characters.json& ";
		setLevelDataString += "xothrog& ";
		setLevelDataString += "player& ";
		setLevelDataString += "0";

		$.ajax({
			type: "GET",
			dataType : 'text',
			url: '/xorx/setproperty.php',
			data: { data: setLevelDataString },
			success: function () {

				response.append(responsePadding + "the demon god seems unaffected, but you feel his willpower is weakened.");
			},
			failure: function() { response.append(responsePadding + "problem triggering xothrog event: server cannot access character level."); }
		});
	}

	function gemTrigger() {
		response.append(responsePadding + "test gemTrigger function");
	}

	function omniscience() {
		response.append(responsePadding + "test omniscience function");
	}
});