const DOM = (function() {
    if (!(userPrompt = document.getElementById("user-prompt")) ||
        !(canvasPlaceholder = document.getElementById("canvas-placeholder")))
            throw new Error("fastyper failed to detect necessary elements.");

    return {
        userPrompt,
        canvasPlaceholder,
    }
})()

const Game = (function() {

    const canvas = document.createElement("canvas");

    (function init_canvas() {

        canvas.width = document.body.clientWidth;
        canvas.height = 800;

        canvas.style.width = canvas.width;
        canvas.style.height = canvas.height;

        context = canvas.getContext("2d");

    })();

    const Objects = {

        stars : [],
        words : []

    }

    const Constants = {

        NUMBER_OF_STARS : 300,
        SPEED : (canvas.width / 3000)

    }

    const Properties = {

        speedMultiplier: 1,
        level: 0,
        lost: false

    }

    const Scoring = {

        seconds: 0,
        characters: 0,
        points: 0,
        WPM: 0,

        start_calculation: function() {
            this.WPM = Math.ceil( (this.characters / 5) / (this.seconds / 60) );
            ++this.seconds;
        }

    }

    const GUI = {

        WPMPos: [ (canvas.width - 100), (canvas.height - 700) ],
        levelPos: [ (canvas.width - 119), (canvas.height - 680) ],
        pointsPos: [ (canvas.width / 2), (canvas.height - 700) ],

        font: "1.5em 'VT323'",
        fontColor: "yellow",

        render: function(){

            context.fillStyle = this.fontColor;
            context.font = this.font;

            context.fillText("wpm: " + Scoring.WPM, this.WPMPos[0], this.WPMPos[1]);
            context.fillText("level: " + Properties.level, this.levelPos[0], this.levelPos[1]);
            context.fillText(Scoring.points, this.pointsPos[0], this.pointsPos[1]);

        }

    }

    const EventListeners = {

        handle_user_prompt: function (event){

            if (recentlyGotWord) {
                DOM.userPrompt.classList.remove("blinking");
                DOM.userPrompt.style.color = "white";
                DOM.userPrompt.textContent = "";
                recentlyGotWord = false;
            }

            if (event.keyCode != 32 && !event.ctrlKey) // if user didn't press spacebar and user isn't pressing CTRL key
                DOM.userPrompt.textContent += String.fromCharCode(event.keyCode);
    
            Objects.words.forEach(wordNode => {
                if(wordNode.word == DOM.userPrompt.textContent){
                    Game.removeWord(wordNode);
                    Game.score();
                }
            });           
        },

        handle_user_backspace: function (event){

            if (event.keyCode == 32 && event.target == document.body) { // prevents the use of scrolling using spacebar
                event.preventDefault();
                return;
            }

            if (event.ctrlKey && event.keyCode == 90) { // CTRL+Z -> deletes user prompt
                DOM.userPrompt.textContent = "";
                return;
            }

            if (event.keyCode == 8){
                DOM.userPrompt.textContent = DOM.userPrompt.textContent.substr(0, (DOM.userPrompt.textContent.length - 1));
                console.log("backspace");
            } // backspace function
        },

        start : function(){
            document.addEventListener("keypress", this.handle_user_prompt);
            document.addEventListener("keydown", this.handle_user_backspace);
        },

        remove : function(){
            document.removeEventListener("keypress", this.handle_user_prompt, true);
            document.removeEventListener("keydown", this.handle_user_backspace, true);
        }
    }

    function level_up() {

        WordManager.insert_words(20);
        ++Properties.level;
        Properties.speedMultiplier += 0.1; 

    }

    function render() {

        if (Game.isOver())
            return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        GUI.render();

        (function render_stars() {

            Objects.stars.forEach(star => {
                star.update();
                star.render();
            });

        })();

        (function render_words() {

            Objects.words.forEach(wordNode => {
                wordNode.update();
                wordNode.render();
            });

        })()

        window.requestAnimationFrame(render);

    }
    //

    return { // public variables&&methods

        isOver: function() {

            return Properties.lost;

        },

        start: async function() {

            DOM.canvasPlaceholder.appendChild(canvas);

            (function create_stars(){
                for (let i = 0; i < Constants.NUMBER_OF_STARS; i++)
                    Objects.stars.push(new Star());
            }) ();

            await WordManager.init();
            WordManager.insert_words(20);

            window.requestAnimationFrame(render);

            this.calculations_loop = setInterval( () => Scoring.start_calculation(), 1000);

            EventListeners.start();

        },

        over: function() {

            window.cancelAnimationFrame(render);

            clearInterval(this.calculations_loop); // ends WPM calculations loop

            DOM.userPrompt.classList.add("blinking");
            DOM.userPrompt.textContent = "GAME OVER";

            Properties.lost = true;
            EventListeners.remove();
        },

        score: function(){

            DOM.userPrompt.style.color = "lawngreen";

            Scoring.characters += DOM.userPrompt.textContent.length;
            Scoring.points += Math.ceil( (3 * Scoring.WPM / 2) );

            recentlyGotWord = true;

            if (Objects.words.length == 10) {
                level_up();
            }

        },

        getCurrentSpeed : function(){
            return Constants.SPEED;
        },

        getSpeedMultiplier : function(){
            return Properties.speedMultiplier;
        },

        getCanvas : function(){
            return canvas;
        },

        addWord : (wordNode) => Objects.words.push(wordNode),

        removeWord : (wordNode) => Objects.words.splice(Objects.words.indexOf(wordNode), 1)
    }
})()

class Star {
    constructor(){

        this.x = Math.random() * Game.getCanvas().width;
        this.y = Math.random() * Game.getCanvas().height;
        this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
    }

    render(){

        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, 2.5, 2.5);

    }

    update(){

        this.x += (Game.getCurrentSpeed() * Game.getSpeedMultiplier()) * 2;

        if (this.x >= Game.getCanvas().width) // if a star reaches the end of canvas
            this.x = 0;

    }
}

class WordNode {    
    constructor(word){

        this.word = word;
        this.x = Math.floor((Math.random() * -400) + (-50));
        this.y = Math.floor((Math.random() * 700) + 100);

    }

    render(){

        if (document.documentElement.scrollTop != 0)
            return;

        context.font = "normal normal 20px 'VT323'";

        let percent = (this.x / Game.getCanvas().width) * 100; // how many % until end of the canvas
        let r = (percent * 4)
        let g = (255 - (percent * 2.5))
      //let b = 0;

        context.fillStyle = "rgb( " + r + "," + g + ", 0, 1)";

        context.fillText(this.word, this.x, this.y);

    }

    update(){

        this.x += Game.getCurrentSpeed() * Game.getSpeedMultiplier();

        if (this.x >= Game.getCanvas().width)
            Game.over();

    }
}

const WordManager = {
    fetch_words: function() {

        return new Promise( (resolve, reject) => {
            const request = new XMLHttpRequest();

            request.open("GET", "https://raw.githubusercontent.com/kibebr/fastyper/master/server/words/" + this.currentAddress + ".txt", false);

            request.onload = () => resolve(request.responseText.split('\n'));
            request.onerror = () => reject( () => {
                throw new Error("fastyper failed to load words.")
            });

            request.send();
        });

    },

    insert_words: async function(quantity) {

        for (let index = this.lastWordIndex, goal = (index + quantity); index < goal; ++index) {
            if (!this.fetchedWords[index]) { // if the text file comes to an end, then load another text file in a different address
                this.lastWordIndex = 0;
                ++this.addressFileNumber;
                this.currentAddress = "en-popular1/" + this.addressFileNumber;
                this.fetchedWords = await this.fetch_words();
                return this.insert_words(quantity);
            }

            Game.addWord(new WordNode(this.fetchedWords[index]));
            ++this.lastWordIndex;
        }

    },

    init: async function() {

        this.lastWordIndex = Math.floor(Math.random() * 950);
        this.addressFileNumber = 3;
        this.currentAddress = "en-popular1/" + this.addressFileNumber;

        this.fetchedWords = await this.fetch_words();
    }
}

let recentlyGotWord = true;

Game.start();
