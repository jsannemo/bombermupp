function Player(/*Number*/y, /*Number*/x, /*Number*/index, /*Input*/input, /*Number*/height, /*Number*/width){
  this.y = y;
  this.x = x;
  this.index = index;
  this.bombsMax = 1;
  this.bombsNow = 0;
  this.input = input;
  this.height = height;
  this.width = width;
  this.alive = true;
}

Player.prototype.rect = function(){
  return new Rect(this.x, this.y, this.width, this.height);
}

Player.prototype.tile = function(/*Number*/tileHeight, /*Number*/tileWidth){
  var centerX = this.x + (this.width/2);
  var centerY = this.y + (this.height/2);
  var tileX = Math.floor(centerX/tileWidth);
  var tileY = Math.floor(centerY/tileHeight);
  return [tileY, tileX];
}

Player.prototype.move = function(/*Number*/dy, /*Number*/dx){
  this.y += dy;
  this.x += dx;
}

Player.prototype.bomb = function(){
  this.bombsNow++;
}
Player.prototype.canBomb = function(){
  return this.bombsNow < this.bombsMax && this.alive;
}

Player.prototype.blast = function(){
  this.bombsNow--;
}