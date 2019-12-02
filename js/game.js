var DOM = (function(){
    if(!(userPrompt = document.getElementById("user-prompt")) ||
       !(canvasPlaceholder = document.getElementById("canvas-placeholder")))
	throw new Error("fastyper failed to detect necessary elements.");
    
    return{
	userPrompt,
	canvasPlaceholder,
	updateUserPrompt : () => userPrompt.innerHTML = Game.userPrompt
    }
}) ()

const Game = (function(){
    
    const canvas = document.createElement("canvas");
    (function init_canvas(){
	canvas.width = document.body.clientWidth;
	canvas.height = 800;

	canvas.style.width = canvas.width;
	canvas.style.height = canvas.height;

	context = canvas.getContext("2d");
    }) ();

    var stars = [];
    const NUMBER_OF_STARS = 100;
    
    // VARIABLES

    var userPrompt = "";
    
    var Properties = {	
	speedMultiplier : 1,
	speed : (canvas.width / 3000),
	
	level : 0,

	lost : false
    }

    var Scoring = {
	seconds : 0,

	characters : 0,
	
	WPM : 0,
	
	start_calculation : function(){
	    ++this.seconds;
	    
	    this.WPM = Math.ceil( (this.characters / 5) / (this.seconds / 60) );
	    
	    console.log(this.WPM);
	}
    }

    // 

    // OBJECTS AND CONSTRUCTORS
    
    var Star = function(){
	var x = Math.random() * canvas.width;
	var y = Math.random() * canvas.height;
	
	return{ // public methods
	    render : function(){
		context.fillStyle = "white";
		context.fillRect(x, y, 2, 2);	    
	    },

	    update : function(){
		x += (Properties.speed * Properties.speedMultiplier) * 2;

		if(x >= canvas.width) // if a star reaches the end of canvas
		    x = 0;
	    }
	}
    }
    for(let i = 0; i < NUMBER_OF_STARS; i++) // subtly initialize the stars
	stars.push(new Star());
	
    var Word = function(word){	
	var x = Math.floor((Math.random() * -400) + (-50));
	var y = Math.floor((Math.random() * 700) + 100);
	
	var next = null;

	return{ // public variables&&methods
	    word,
	    
	    render : function(){
		if(document.documentElement.scrollTop != 0)
		    return;
		
		context.font = "normal normal bold 15px 'Fira Code'";
				
		let percent = (x / canvas.width) * 100; // how many % until end of the canvas
		let r = (percent * 4)
		let g = (255 - (percent * 2.5))
	      //let b = 0;
		
		context.fillStyle = "rgb( " + r + "," + g + ", 0, 1)"; // produces color effect on words
		
		context.fillText(word, x, y);
	    },

	    update : function(){
		x += Properties.speed * Properties.speedMultiplier;
		
		if(x >= canvas.width)
		    Game.over();

		if(Game.userPrompt == word){
		    WordManager.hashtable.remove(this);
		    DOM.userPrompt.style.color = "lawngreen";

		    Scoring.characters += Game.userPrompt.length;
		    Game.userPrompt = "";
		   
		    recentlyGotWord = true;

		    if(WordManager.hashtable.length == 10){
			level_up();
		    }
		}		
	    }
	}	
    }
    
    //
    
    function level_up(){
	WordManager.insert_words(20);
	++Properties.level;
	Properties.speedMultiplier += 0.1;
    }

    function render(){
	if(Game.isOver())
	    return;
	
	context.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
	
	(function render_GUI(){
	    let bottomTextY = (canvas.height - 10);
	    
	    context.fillStyle = "lawngreen";
	    context.font = "bold 1.050em 'Fira Code'";
	    
	    context.fillText("wpm: " + Scoring.WPM, 100, bottomTextY);

	    context.fillText("level: " + Properties.level, (canvas.width - 200), bottomTextY);
	}) ();

	(function render_stars(){
	    for(let i = 0; i < NUMBER_OF_STARS; i++){
		stars[i].render();
		stars[i].update();
	    }
	}) ();

	(function render_words(){
	    for(let letter = 'a'; letter <= 'z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)){
		if(thisWord = WordManager.hashtable.table[letter]){
		    while(thisWord != null){
      			thisWord.render();
			thisWord.update();
      			thisWord = thisWord.next;
		    }
		}
	    }	   
	}) ()
	window.requestAnimationFrame(render);
    }
    //
    
    return { // public variables&&methods
	Word,
	userPrompt,

	isOver : function() { return Properties.lost; },
	
	start : async function(){
	    DOM.canvasPlaceholder.appendChild(canvas);
	    
	    await WordManager.init();
	    WordManager.insert_words(20);
	    
	    window.requestAnimationFrame(render);
	    this.calculations_loop = setInterval( () => Scoring.start_calculation(), 1000);
	},

	over : function(){
	    window.cancelAnimationFrame(render);
	    clearInterval(this.calculations_loop); // ends WPM calculations loop

	    DOM.userPrompt.classList.add("blinking");
	    DOM.userPrompt.innerHTML = "GAME OVER";
	    Properties.lost = true;
	}
    }
}) ()

var WordManager = {
    fetch_words : function(){
	return new Promise( (resolve, reject) => {
	    const request = new XMLHttpRequest();

	    request.open("GET", "https://raw.githubusercontent.com/kibebr/fastyper/master/server/words/" + this.currentAddress + ".txt", false);

    	    request.onload = () => resolve(request.responseText.split('\n'));
    	    request.onerror = () => reject( () => { throw new Error("fastyper failed to load words.") } );

    	    request.send();
    	});		
    },

    insert_words : async function(quantity){
	for(let index = this.lastWordIndex, goal = (index+quantity); index < goal; ++index){
	    if(!this.loadedWords[index]){ // if the text file comes to an end, then load another text file in a different address
		this.lastWordIndex = 0;
		++this.addressFileNumber;
		this.currentAddress = "en-popular1/"+this.addressFileNumber;
		this.loadedWords = await this.fetch_words();
		return this.insert_words(quantity);
	    }
	    
	    this.hashtable.put(new Game.Word(this.loadedWords[index]));	    
	    ++this.lastWordIndex;
	}
    },	

    init : async function(){
	this.hashtable = new Hashtable();

	this.lastWordIndex = Math.floor(Math.random() * 950);
	this.addressFileNumber = 3;
	this.currentAddress = "en-popular1/"+this.addressFileNumber;

	this.loadedWords = await this.fetch_words();
    }
}
Game.start();

let recentlyGotWord = true;

// EVENT LISTENERS
document.addEventListener("keypress", function handle_user_prompt(event){
    if(Game.isOver()) return;

    if(recentlyGotWord){
	DOM.userPrompt.classList.remove("blinking");
	DOM.userPrompt.style.color = "white";
	recentlyGotWord = false;
    }

    if(event.keyCode != 32 && !event.ctrlKey) // if user didn't press spacebar and user isn't pressing CTRL key
	Game.userPrompt += String.fromCharCode(event.keyCode);
    
    DOM.updateUserPrompt();
});

document.addEventListener("keydown", function handle_user_backspace(event){
    if(Game.isOver()) return;

    if(event.keyCode == 32 && event.target == document.body){ // prevents the use of scrolling using spacebar
	event.preventDefault();
	return;
    }
    
    if(event.ctrlKey && event.keyCode == 90){ // CTRL+Z -> deletes user prompt
	Game.userPrompt = "";
	return;
    }
    
    if(event.keyCode == 8) // backspace function
	Game.userPrompt = Game.userPrompt.substr(0, (Game.userPrompt.length - 1));
    
    DOM.updateUserPrompt();
});
