let htmlUserPrompt = document.getElementById("user-prompt");

var WordManager = {
	fetch_words : function(){
    	return new Promise((resolve, reject) => {
    		const request = new XMLHttpRequest();

    		request.open("GET", "https://raw.githubusercontent.com/kibebr/fastyper/master/server/words/" + this.currentAddress + ".txt", false);

    		request.onload = () => resolve(request.responseText.split('\n'), 1);
    		request.onerror = () => reject("FATAL ERROR: FAILED TO LOAD WORDS");

    		request.send();
    	});		
	},

	insert_words : async function(quantity){
		for(let index = this.lastWordIndex, goal = (index+quantity); index < goal; ++index){
			if(!this.loadedWords[index]){
				this.lastWordIndex = 0;
				++this.addressFileNumber;
				this.currentAddress = "en-popular1/"+this.addressFileNumber;
				this.loadedWords = await this.fetch_words();
				return this.insert_words(quantity);
			}

			this.hashtable.put(this.loadedWords[index], Game.context);
			++this.lastWordIndex;
		}
	},	

	init : async function(){
		this.hashtable = new Hashtable();

		this.lastWordIndex = Math.floor(Math.random() * 950);
		this.addressFileNumber = 0;
		this.currentAddress = "en-popular1/"+this.addressFileNumber;

		this.loadedWords = await this.fetch_words();
	}
}

var Game = {
	canvas : document.createElement("canvas"),

	init_canvas : function(){
		this.canvas.width = document.body.clientWidth - 15;
		this.canvas.height = 800;

		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.getElementById("canvas-placeholder").parentNode);
		this.context.font = "normal normal bold 15px 'Fira Code'";

		return true;
	},

	init_properties : function(){
		this.userPrompt = "";
		this.speedMultiplier = 1;
		this.speed = (this.canvas.width / 1500);

		this.level = 0;
		this.lost = false;

		return true;
	},

	start : async function(){
		await WordManager.init();
		WordManager.insert_words(20);
		this.interval = setInterval(update_game, 20);
	},

	over : function(){
		clearInterval(this.interval); // stops game loop
		htmlUserPrompt.classList.add("blinking");
		htmlUserPrompt.innerHTML = "GAME OVER";
		this.lost = true;
	},

	clearCanvas : function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}


Game.init_canvas();
Game.init_properties();
Game.start();

function update_game(){
	Game.clearCanvas();

	console.log(WordManager.hashtable.length);
    for(let letter = 'a'; letter <= 'z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)){
		if(cursor = WordManager.hashtable.table[letter])
          	while(cursor != null){
          		update_word(cursor);
          		cursor = cursor.next;
          	}
    }
}

let recentlyGotWord = true;
function update_word(word){
	word.x += Game.speed * Game.speedMultiplier;
	
	let percent = (word.x / Game.canvas.width) * 100; // how many % until end of the canvas
    Game.context.fillStyle = "rgb( " + (percent * 3) + "," + (255 - (percent * 3)) +", 0	, 255)";

    if(word.x >= Game.canvas.width)
    	Game.over();

    if(WordManager.hashtable.remove(Game.userPrompt)){
    	htmlUserPrompt.style.color = "lawngreen";
    	recentlyGotWord = true;
    	Game.userPrompt = "";

    	if(WordManager.hashtable.length == 10){
    		WordManager.insert_words(20);
    		++Game.level;
    		Game.speedMultiplier += 0.1;
    	}
    }
    word.update();
}

// EVENT LISTENERS
document.addEventListener("keypress", function handle_user_prompt(event){
	if(Game.lost) return;

	if(recentlyGotWord){
		htmlUserPrompt.classList.remove("blinking");
		htmlUserPrompt.style.color = "white";
		recentlyGotWord = false;
	}

	if(event.keyCode != 32 && !event.ctrlKey) // if user didn't press spacebar and user isn't pressing CTRL key
		Game.userPrompt += String.fromCharCode(event.keyCode);

	htmlUserPrompt.innerHTML = Game.userPrompt;
});

document.addEventListener("keydown", function handle_user_backspace(event){
	if(Game.lost) return;

	if(event.keyCode == 8){ // backspace
		Game.userPrompt = Game.userPrompt.substr(0, (Game.userPrompt.length - 1));
		htmlUserPrompt.innerHTML = Game.userPrompt;
	} 

	if(event.keyCode == 32 && event.target == document.body) // prevents the use of scrolling using spacebar
		event.preventDefault();

	if(event.ctrlKey && event.keyCode == 90) // CTRL+Z -> deletes user prompt
		Game.userPrompt = "";
});