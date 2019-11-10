	class Node{
		constructor(word, canvasContext){
			this.word = word;
			this.next = null;
			this.x = Math.floor((Math.random() * -400) + (-50));
			this.y = Math.floor((Math.random() * 750) + 100);
		}

		update(canvasContext){
			canvasContext.fillText(this.word, this.x, this.y);
		}
	}

	class Hashtable{
		constructor(size = 26){
			this.table = new Array(size);
			this.size = size;
			this.length = 0;
		}

		put(word){
			let key = word[0]; 
			let node = new Node(word);

			if(this.table[key] == undefined)
				this.table[key] = node;	
			else{ 
				node.next = this.table[key]; 
				this.table[key] = node;
			}
			++this.length;
		}

		remove(word){
			let key = word[0];

			if(this.table[key]){
     			if(this.table[key].word === word){
        			this.table[key] = this.table[key].next;
        			--this.length;
        			return true;	
     			}
     			else{
       				let current = this.table[key].next;
       				let prev = this.table[key];
       				while(current){
         				if(current.word === word){
           					prev.next = current.next;
           					--this.length;
           					return true;
         				}
         				prev = current;
         				current = current.next;
       				}
     			}
  			}
  		}

  		search(word){
  			for(let cursor = this.table[word[0]]; cursor != null; cursor = cursor.next)
  				if(cursor.word == word)
  					return cursor;		
  		}
	}