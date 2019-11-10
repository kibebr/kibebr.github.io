var words = new Hashtable();

var game = {
	canvas : document.createElement("canvas"),

	init_canvas : function(){
		this.canvas.width = document.body.clientWidth - 15;
		this.canvas.height = 800;

		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.getElementById("canvas-placeholder").parentNode);
		this.context.font = "normal normal bold 15px consolas";

		return true;
	},

	init_properties : function(){
		this.userPrompt = "";
		this.speed = (this.canvas.width / 1200);

		this.lastWordIndex = 0;
		this.allWords = this.load_words();

		return true;
	},

	load_words : function(){
    	return new Promise((resolve, reject) => {
    		const request = new XMLHttpRequest();

    		request.open("GET", "https://gist.githubusercontent.com/deekayen/4148741/raw/01c6252ccc5b5fb307c1bb899c95989a8a284616/1-1000.txt", false);

    		request.onload = () => resolve(request.responseText.split('\n'));
    		request.onerror = () => reject("ERROR LOADING WORDS");

    		request.send();
    	});
	},

	insert_words : async function(quantity){
		for(let index = this.lastWordIndex, goal = (index+quantity), wordsPtr = await this.allWords; index < goal; ++index){
			words.put(wordsPtr[index]);
			++this.lastWordIndex;
		}
	},

	start : function(){
		this.insert_words(20);
		this.interval = setInterval(update_game, 20);
	},

	clearCanvas : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

let htmlUserPrompt = document.getElementById("user-prompt");

game.init_canvas();
game.init_properties();
game.start();

function update_game(){
	game.clearCanvas();

    for(let letter = 'a'; letter <= 'z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)){
		if(words.table[letter]){
        	let cursor = words.table[letter];
          	while(cursor != null){
          		update_word(cursor);
            	cursor = cursor.next;
          	}
        }
    }
}

let recentlyGotWord = true;
function update_word(object){
	object.x += game.speed;
	
	let percent = (object.x / game.canvas.width)*100;
    game.context.fillStyle = "rgb( " + (percent*2.5) + "," + (255-(percent*2.5)) +", 60, 255)";

    object.update(game.context);

    if(words.remove(game.userPrompt)){
    	htmlUserPrompt.style.color = "lawngreen";
    	recentlyGotWord = true;
    	game.userPrompt = "";
    }
}

// EVENT LISTENERS
document.addEventListener("keypress", function handle_user_prompt(event){
	if(recentlyGotWord){
		htmlUserPrompt.classList.remove("blinking");
		htmlUserPrompt.style.color = "white";
		recentlyGotWord = false;
	}

	if(event.keyCode != 32) // if user didn't press spacebar
		game.userPrompt += String.fromCharCode(event.keyCode);

	htmlUserPrompt.innerHTML = game.userPrompt;
});

document.addEventListener("keydown", function handle_user_backspace(event){
	if(event.keyCode == 8) // backspace
		game.userPrompt = game.userPrompt.substr(0, (game.userPrompt.length - 1));

	if(event.keyCode == 32 && event.target == document.body) // prevents the use of scrolling using spacebar
		event.preventDefault();

	htmlUserPrompt.innerHTML = game.userPrompt;
});