var constants = require('./constants.js');
var Rectangle = require('./rectangle.js').Rectangle;
var BombType = require('./bomb.js').BombType;

function Player(/*Number*/y, /*Number*/x, /*Number*/index, /*Input*/input){
  this.y = y;
  this.x = x;
  
  this.index = index;
  this.input = input;

  this.speed = constants.PLAYER_SPEED;
  this.bombsMax = constants.MAX_BOMBS;
  this.bombsNow = 0;
  this.alive = true;
  
  this.bombType = BombType.cross;
}

Player.prototype.getTile = function(){
  var centerX = this.x;
  var centerY = this.y;
  var tileX = Math.floor(centerX/constants.TILE_SZ);
  var tileY = Math.floor(centerY/constants.TILE_SZ);
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
  return (this.bombsNow < this.bombsMax) && this.alive;
}

Player.prototype.blast = function(){
  this.bombsNow--;
}

exports.Player = Player;