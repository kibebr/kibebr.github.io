class Hashtable{
    constructor(size = 26){
	this.table = new Array(size);
	this.size = size;
	this.length = 0;
    }
    
    put(WordNode){
	let key = WordNode.word[0];
	
	if(this.table[key] == undefined)
	    this.table[key] = WordNode;	
	else{ 
	    WordNode.next = this.table[key]; 
	    this.table[key] = WordNode;
	}
	++this.length;
    }


    remove(WordNode){
	let key = WordNode.word[0];

	if(this.table[key]){
     	    if(this.table[key].word === WordNode.word){
        	this.table[key] = this.table[key].next;
        	--this.length;
        	return true;	
     	    }
     	    else{
       		let current = this.table[key].next;
       		let prev = this.table[key];
		
       		while(current){
         	    if(current.word === WordNode.word){
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
}
