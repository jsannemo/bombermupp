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
  
  var updater = function(e, x){
    var change = false;
    if(e.which == input.LEFT && input.left != x){
      input.left = x;
      update = true;
    } else if(e.which == input.UP && input.up != x){
      input.up = x;
      updated = true;
    } else if(e.which == input.RIGHT && input.right != x){
      input.right = x;
      updated = true;
    } else if(e.which == input.DOWN && input.down != x){
      input.down = x;
      updated = true;
    } else if(e.which == input.BOMB && input.bomb != x){
      input.bomb = x;
      updated = true;
    }
    if(updated){
      socket.emit("input", {left: input.left, up:input.up, right:input.right, down:input.down, bomb:input.bomb});
    }
  };
  
  $("body").keydown(function(e){
    updater(e, true);
  });
  $("body").keyup(function(e){
    updater(e, false);
  });
}