function Input(/*Number*/left, /*Number*/up, /*Number*/right, /*Number*/down, /*Number*/bomb){
  this.LEFT = left;
  this.UP = up;
  this.RIGHT = right;
  this.DOWN = down;
  this.BOMB = bomb;
  
  this.up = false;
  this.down = false;
  this.right = false;
  this.left = false;
  this.bomb = false;
  
  this.createListeners();
}

Input.prototype.createListeners = function(){
  var input = this;
  $("body").keydown(function(e){
    if(e.which == input.LEFT){
      input.left = true;
    } else if(e.which == input.UP){
      input.up = true;
    } else if(e.which == input.RIGHT){
      input.right = true;
    } else if(e.which == input.DOWN){
      input.down = true;
    } else if(e.which == input.BOMB){
      input.bomb = true;
    }
  });
  $("body").keyup(function(e){
    if(e.which == input.LEFT){
      input.left = false;
    } else if(e.which == input.UP){
      input.up = false;
    } else if(e.which == input.RIGHT){
      input.right = false;
    } else if(e.which == input.DOWN){
      input.down = false;
    } else if(e.which == input.BOMB){
      input.bomb = false;
    }
  });
}