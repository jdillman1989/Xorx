$(document).ready( function(){

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
	var currentInventory = [];
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

				console.log("Executing look with " + verb + " and " + subject1);

				look(subject1);
				break;
			case "say":
			case "tell":
			case "greet":
			case "call":
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
			case "steal":
				take(subject1, subject2);
				break;
			case "drop":
				drop(subject1);
				break;
			case "attack":
			case "shoot":
			case "fire":
				attack(subject1, subject2);
				break;
			case "ask":
				ask();
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
				move(subject1);
				break;
			case "help":
			case "hint":
			case "fuck":
				help();
				break;
			case "new":
				createCharacter(1);
				break;
			case "continue":
				gamePrompt = "type the name of the character you want to play.";
				response.append(responsePadding + gamePrompt);
				prompting = true;
				break;
			default:
				parseError(genericError);
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
		playerInfo.inventory = {"slot1": "","slot2": "","slot3": ""};
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
				}
			};
		});
	};

	function startGame (player) {

		getCurrentPlayerInfo(player);

		playerNameDisplay.html(currentPlayer);

		if (currentInventory[0] != undefined) {
			inventory.append("<br>" + currentInventory[0]);
		};

		if (currentInventory[1] != undefined) {
			inventory.append("<br>" + currentInventory[1]);
		};

		if (currentInventory[2] != undefined) {
			inventory.append("<br>" + currentInventory[2]);
		};

		trait.append("<br>" + currentTrait);

		console.log(currentTrait);

		$.getJSON( 'map.json', function(data) {

			for (var i = 0; i <= data.length-1; i++) {

				if (data[i].roomname == currentLocation) {
					response.append(responsePadding + "you are at " + data[i].roomdescription + ".");
					image.css({ "background-image" : "url('images/" + data[i].roomname + ".png')" });
					break;
				}

				else {

					if (i >= data.length-1) {

						response.append(responsePadding + "starting location error.");
					};
				};
			};
		});		
	};

	function getCurrentPlayerInfo (character) {

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length; i++) {

				if ( data[i].name == character ) {

					currentPlayer = data[i].name;
					currentLocation = data[i].location;

					currentInventory.push(data[i].inventory.slot1);
					currentInventory.push(data[i].inventory.slot2);
					currentInventory.push(data[i].inventory.slot3);

					currentDescription = data[i].description;
					currentTrait = data[i].trait;

					break;
				};
			};
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

		console.log("Starting look with " + subject);

		var intendedSubject = parseSubject(subject);

		function lookSubjectTest () {

			$.getJSON( 'characters.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					console.log("Running character test with " + intendedSubject + " and " + data[i].name);

					if ( data[i].name == intendedSubject && data[i].location == currentLocation ) {

						console.log("Successful character test with " + intendedSubject + " and " + data[i].name);

						response.append(responsePadding + "You see " + data[i].description + ".");
					};
				};

				$.getJSON( 'items.json', function(data2) {

					console.log("Running item test with " + intendedSubject);

					for (var i = 0; i <= data2.length-1; i++) {

						console.log("Running item test with " + intendedSubject + " and " + data2[i].name);

						if ( data2[i].name == intendedSubject && data[i].location == currentLocation ) {

							response.append(responsePadding + "You see " + data2[i].description + ".");
							image.css({ "background-image" : "url('images/" + data2[i].name + ".png')" });
						}

						else if ( intendedSubject == "tower" || intendedSubject == "console" || intendedSubject == "obelisk") {

							switch (intendedSubject) {
								case "tower":
									response.append(responsePadding + "You see " + data2[5].description + ".");
									image.css({ "background-image" : "url('images/" + data2[i].name + ".png')" });
									break;
								case "console":
									response.append(responsePadding + "You see " + data2[12].description + ".");
									image.css({ "background-image" : "url('images/" + data2[i].name + ".png')" });
									break;
								case "obelisk":
									prompting = true;
									gamePrompt = "what side of the obelisk do you want to look at?";
									response.append(responsePadding + gamePrompt);
									break;
							};
						};
					};
				});
			});
		};

		if (intendedSubject || intendedSubject != "around") {

			console.log("Starting intended subject test with " + intendedSubject);

			lookSubjectTest();
		}

		else {

			console.log("Intended subject not evaluated, starting location arrays.");

			var locationItemArray = [];

			var locationCharacterArray = [];

			$.getJSON( 'map.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].name == currentLocation) {

						response.append(responsePadding + "You see " + data[i].roomdescription + ".");
					};
				};
			});

			$.getJSON( 'items.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].location == currentLocation) {

						locationItemArray.push(data[i].description);
					};
				};
			})
				.done( function() {

					if ( locationItemArray.length != 0 ) {

						for (var i = 0; i <= locationItemArray.length; i++) {

							response.append(responsePadding + "There is " + locationItemArray[i] + ".");
						};
					};
				});

			$.getJSON( 'characters.json', function(data) {

				for (var i = 0; i <= data.length-1; i++) {

					if ( data[i].location == currentLocation) {

						locationCharacterArray.push(data[i].description);
					};
				};
			})
				.done( function() {

					if ( locationCharacterArray.length != 0 ) {

						for (var i = 0; i <= locationCharacterArray.length; i++) {

							response.append(responsePadding + "There is " + locationItemArray[i] + ".");
						};
					};
				});
		};
	};

});