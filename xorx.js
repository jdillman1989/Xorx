$(document).ready( function(){

	var image = $('#screen');
	var response = $('#response');
	var input = $('#input');
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

	response.append(responsePadding + "type new to start a new character. type continue to play an existing character.");

	input.keydown( function( event ) {

		playerInput = input.val();

		if ( event.which == 13 ) {
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

		switch (verb) {
			case "look":
			case "inspect":
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
				playerName = userAnswer;
				createCharacter(2);
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
				saveCharacter(playerName, playerSuit, playerSuit);
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
		playerInfo.location = "ObeliskHill";
		playerInfo.inventory = {"slot1": "","slot2": "","slot3": ""};
		playerInfo.description = "a human with " + hair + "hair, wearing a " + suit + "jumpsuit.";
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

			for (var i = 0; i <= data.length; i++) {

				console.log("continuePlay(3): " + prompting + data[i].name + nameTest + " test");

				if ( data[i].name == nameTest ) {
					prompting = false;
					matchingCharacter = data[i].name;
					currentPlayer = matchingCharacter;
					startGame(currentPlayer);
					break;
				}

				else{

					if (i == data.length) {
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

		getCurrentLocation(player);

		$.getJSON( 'map.json', function(data) {

			for (var i = 0; i <= data.length; i++) {

				console.log("startGame(1): " + currentLocation + " test");

				if ( data[i].roomName == currentLocation ) {
					response.append(responsePadding + "You are at " + data[i].roomDescription + ".");
					image.css({ "background-image" : "url('images/" + data[i].roomName + ".png')" });
					break;
				}

				else {
					response.append(responsePadding + "startGame() error.");
				};
			};
		});		
	};

	function getCurrentLocation (character) {

		$.getJSON( 'characters.json', function(data) {

			for (var i = 0; i <= data.length; i++) {

				console.log("getCurrentLocation(4): " + character + data[i].name + " test");

				if ( data[i].name == character ) {
					currentLocation = data[i].location;
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

	// function look (subject) {
	// 	if (subject != "" || subject != "around") {
	// 		if (subject == item) {
	// 			response.append(responsePadding + item.description);
	// 			image.css({ "background-image" : "url('" + item.name + ".jpg')" });
	// 		}
	// 		else if (subject == character) {
	// 			response.append(responsePadding + character.description);
	// 		}
	// 		else {
	// 			response.append(responsePadding + location.description);
	// 		}
	// 	}
	// 	else {
	// 		response.append(responsePadding + location.description);
	// 	};
	// };

	// function greet (subject) {
	// 	if (subject == character.name) {
	// 		if (subject == "xothrog") {

	// 			response.append(responsePadding + "he doesn't seem interested in talking.");
	// 		} 

	// 		else if (subject == "xia") {

	// 			response.append(responsePadding + "this person can't understand you.");
	// 		}

	// 		else if (subject == "xaph") {

	// 			response.append(responsePadding + "the only response you get is a high-pitched squawk and a flutter of wings.");
	// 		}

	// 		else{

	// 			response.append(responsePadding + subject + " nods knowingly");
	// 		}
	// 	}

	// 	else{
	// 		response.append(responsePadding + "there was no response.");
	// 	};
	// };
});