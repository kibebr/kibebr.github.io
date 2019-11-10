var game = {
	canvas : document.createElement("canvas"),
	start : function(){
		this.canvas.width = document.body.clientWidth - 15;
		this.canvas.height = 700;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.getElementById("canvas-placeholder").parentNode);

		this.context.font = "normal normal bold 15px consolas";

		this.userPrompt = "";
		this.speed = (this.canvas.width / 1000);
		this.interval = setInterval(updateGame, 20);
	},
	clear : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
var words = new Hashtable();
let htmlUserPrompt = document.getElementById("user-prompt");
game.start();


var wordsToPut = ["test", "indent", "show", "however", "maybe", "therefore", "letter", "okay", "thanks"];

for(let i = 0, len = wordsToPut.length; i < len; ++i)
	words.put(wordsToPut[i]);

function updateGame(){
	game.clear();

    for(let letter = 'a'; letter <= 'z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)){
		if(words.table[letter]){
        	let cursor = words.table[letter];

          	while(cursor != null){
          		updateWord(cursor);
            	cursor = cursor.next;
          	}
        }
    } 
}


function updateWord(object){
	object.x += game.speed;
	
	let percent = (object.x / game.canvas.width)*100;
    game.context.fillStyle = "rgb( " + (percent*2.5) + "," + (255-(percent*2.5)) +", 60, 255)";

    object.update(game.context);
    
    if(words.remove(game.userPrompt)){
    	game.userPrompt = "";
    }
}


// EVENT LISTENERS

document.addEventListener("keypress", function handleUserPrompt(event){
	htmlUserPrompt.classList.remove("blinking");

	if(event.keyCode != 32)
		game.userPrompt += String.fromCharCode(event.keyCode);

	htmlUserPrompt.innerHTML = game.userPrompt;
});

document.addEventListener("keydown", function getUserBackspace(event){
	if(event.keyCode == 8)
		game.userPrompt = game.userPrompt.substr(0, (game.userPrompt.length - 1));

	if(event.keyCode == 32 && event.target == document.body) // prevents the use of spacebar
		event.preventDefault();

	htmlUserPrompt.innerHTML = game.userPrompt;
});
