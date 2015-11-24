$(document).ready( function(){

	var image = $('#image');
	var response = $('#response');
	var input = $('#input');
	var inventory = $('#inventory');
	var ability = $('#ability');

	var responsePadding = "<br><br>&gt;";
	var genericError = "your command did not work. please try something different. type help for basic game instructions.";
	var gameInstructions = "you are a human mysteriously trapped on a strange alien world. is there a way back home? or maybe there is an amazing discovery to be made here...<br>basic instructions: type in the box to control your character. everything you type MUST be lower case. examples: 'take rock', 'look rock', 'go west'. if something seems broken or you have any suggestions, please email the developer at jesse@jdillman.com<br>keep in mind that there is more to this game than it may seem at first. :)";

	var gameStarting = true;
	var characterCreation = false;
	var createStep = 1;
	var playerName = "";
	var playerHair = "";
	var playerSuit = "";

	input.keydown(function( event ) {

		playerInput = input.val();

		if ( event.which == 13 ) {
			if (gameStarting) {

				if (!characterCreation) {

					if (playerInput == "new" || playerInput == "continue") {

						parseText(playerInput);
					}

					else{

						response.append(responsePadding + "please type only new or continue to proceed.");
					};

				} 

				else {

					if (createStep == 1) {

						playerName = playerInput;
						createCharacter(2);
					} 

					else if (createStep == 2) {

						playerHair = playerInput;
						createCharacter(3);
					}

					else if (createStep == 3) {

						playerSuit = playerInput;
						createCharacter(4);
					}

				};
			}

			else{

				parseText(playerInput);
			};
		}
	});

	$.getJSON('scores.json', function(data) {
		var output="";
		for (var i in data) {
			output+="<tr>";
			output+="<td>" + data[i].player + "</td><td>" + data[i].level + "</td><td>" + data[i].score + "</td>";
			output+="</tr>";
		}
		scoreTable.append(output);
	});
	
	function parseText(userText){
		
		var userTextArray = userText.split(" ");

		for (i = 0; i <= userTextArray.length-1; i++) {

			if ( userTextArray[i]=="at" || userTextArray[i]=="a" || userTextArray[i]=="the" || userTextArray[i]=="an" || userTextArray[i]=="with" || userTextArray[i]=="using" || userTextArray[i]=="to" || userTextArray[i]=="out" ) {
				userTextArray.splice(i, 1);
			};
		};

		var verb = userTextArray[0];
		var subject1 = userTextArray[1];
		var subject2 = userTextArray[2];

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
				createCharacter(createStep);
				break;
			case "continue":
				continuePlay();
				break;
		};
	};

	function createCharacter(step){

		if (gameStarting) {

			characterCreation = true;

			if (step == 1) {

				response.append(responsePadding + "what is this human's name?");
				createStep = 2;
			} 

			else if (step == 2) {

				response.append(responsePadding + "what is this human's hair color?");
				createStep = 3;
			}

			else if (step == 3) {

				response.append(responsePadding + "the human is wearing a jumpsuit. what color is it?");
				createStep = 4;
			}

			else if (step == 4) {

				response.append(responsePadding + "success. starting game now...");
				gameStarting = false;
				characterCreation = false;
				saveCharacter(playerName, playerHair, playerSuit);
			}

			else {

				response.append(responsePadding + "error: something went wrong during character creation. please refresh the browser window to restart.");

			};
		} 

		else{

			response.append(responsePadding + "if you would like to create a new character, please refresh this browser window.");
		};
	};

	function saveCharacter (name, hair, suit) {

			var playerInfo = new Object();

			playerInfo.player = tag;
			playerInfo.level = currentLevel;
			playerInfo.score = currentScore;

			$.ajax
				({
					type: "GET",
					dataType : 'json',
					async: false,
					url: '/xorx/newplayer.php',
					data: { data: JSON.stringify(playerInfo) },
					success: function () { continuePlay(); },
					failure: function() { response.append(responsePadding + "problem saving new character: server disrupted save process."); }
				});
	}

	function help () {
		response.append(responsePadding + gameInstructions);
	};

	function look (subject) {
		if (subject != "" || subject != "around") {
			if (subject == item) {
				response.append(responsePadding + item.description);
				image.css({ "background-image" : "url('" + item.name + ".jpg')" });
			}
			else if (subject == character) {
				response.append(responsePadding + character.description);
			}
			else {
				response.append(responsePadding + location.description);
			}
		}
		else {
			response.append(responsePadding + location.description);
		};
	};

	function greet(subject){
		if (subject == character.name) {
			if (subject == "xothrog") {

				response.append(responsePadding + "he doesn't seem interested in talking.");
			} 

			else if (subject == "xia") {

				response.append(responsePadding + "this person can't understand you.");
			}

			else if (subject == "xaph") {

				response.append(responsePadding + "the only response you get is a high-pitched squawk and a flutter of wings.");
			}

			else{

				response.append(responsePadding + subject + " nods knowingly");
			}
		}

		else{
			response.append(responsePadding + "there was no response.");
		};
	};

	function parseError (errorMessage) {
		response.append(responsePadding + errorMessage);
	};
});