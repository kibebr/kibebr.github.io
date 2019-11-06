var gameArea = {
	canvas : document.createElement("canvas"),
	start : function(){
		this.canvas.width = 1250;
		this.canvas.height = 700;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.getElementById("canvas-placeholder").parentNode);

		this.context.font = "normal normal bold 15px consolas";

		this.interval = setInterval(updateGameArea, 20);
	},
	clear : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
gameArea.start();


var userPrompt = "type here⠀";

var wordsToPut = ["test", "indent", "show", "however", "maybe", "therefore", "letter", "okay", "thanks"];
var words = new Hashtable();

for(let i = 0, len = wordsToPut.length; i < len; ++i)
	words.put(wordsToPut[i]);

function updateGameArea(){
	gameArea.clear();

    for(let letter = 'a'; letter <= 'z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)){
		if(words.table[letter]){
        	let cursor = words.table[letter];

          	while(cursor != null){
          		cursor.x += 1;

          		gameArea.context.fillStyle = "rgb( " + (cursor.x/2) + "," + (255-(cursor.x/5)) +", 20, 255)";

          		if(userPrompt == cursor.word){
          			userPrompt = "";
          			words.remove(cursor.word);
          		}

          		cursor.update(gameArea.context);
            	cursor = cursor.next;
          	}
        }
    }
    
    if(userPrompt == "type here⠀")
    	document.getElementById("user-prompt").classList.add("blinking");
    else
    	document.getElementById("user-prompt").classList.remove("blinking");
   
    document.getElementById("user-prompt").innerHTML = userPrompt;
}


// EVENT LISTENERS
let firstTimeTyping = true;
document.addEventListener("keypress", function handleUserPrompt(event){
	if(firstTimeTyping){
		userPrompt = "";
		firstTimeTyping = false;
	}

	if(event.keyCode != 32)
		userPrompt += String.fromCharCode(event.keyCode);
});

document.addEventListener("keydown", function getUserBackspace(event){
	if(event.keyCode == 8)
		userPrompt = userPrompt.substr(0, (userPrompt.length - 1));

	if(event.keyCode == 32 && event.target == document.body) // prevents the use of spacebar
		event.preventDefault();
});
