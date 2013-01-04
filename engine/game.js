var player = require('./player.js');
var map = require('./map.js');
var bomb = require('./bomb.js');
var constants = require('./constants.js');

function Game(/*Array[Input]*/playerInputs, /*Map*/map, /*Array[Socket]*/sockets){
  this.map = map;
  this.inputs = playerInputs;
  this.bombs = [];
  this.blastTime = new Array(this.map.height);
  this.sockets = sockets;
  
  for(var i = 0; i<this.map.height; i++){
    this.blastTime[i] = new Array(this.map.width);
    for(var j = 0; j<this.map.width; j++){
      this.blastTime[i][j] = 0;
    }
  }
}

Game.prototype.start = function(){
  console.log("Starting!");
  this.clock = Date.now();
  this.lastPush = Date.now();
  this.initPlayers();
  this.tick();
}

Game.prototype.initPlayers = function(){
  this.playerCount = this.inputs.length;
  this.alive = this.playerCount;
  this.players = [];
  
  var positions = this.map.positions;
  for(var i = 0; i<this.playerCount; i++){
    var realX = positions[i][1]*constants.TILE_SZ + constants.PLAYER_SZ/2;
    var realY = positions[i][0]*constants.TILE_SZ + constants.PLAYER_SZ/2;
    this.players.push(new player.Player(realY, realX, i, this.inputs[i]));
  }
}

Game.prototype.tick = function(){
  var game = this;
  var currentTime = Date.now();
  if(currentTime - game.clock > 16.66666666666666){
    this.checkBombs();
    this.checkBlasts();
    this.checkDeaths();
    this.movePlayers();
    this.clock = currentTime;
  }
  
  if(currentTime - this.lastPush > 100){
    for(var i = 0; i < this.playerCount; i++){
      this.pushState(i);
    } 
    this.lastPush = currentTime;
  }
  
  setTimeout(function(){
    game.tick();
  }, 15);
}

Game.prototype.pushState = function(/*Number*/idx){
  var player = this.players[idx];
  var socket = this.sockets[idx];
  var players = [];
  var tiles = [];
  for(var i = 0; i<this.playerCount; i++){
    var pl = this.players[i];
    players.push({x: pl.x, y: pl.y, alive: pl.alive});
  }
  for(var y = 0; y<this.map.height; y++){
    for(var x = 0; x<this.map.width; x++){
      tiles.push({x: x, y: y, color: this.map.tiles[y][x].color, blast: this.blastTime[y][x] > 0});
    }
  }
  socket.emit("update", {
    players: players,
    tiles: tiles,
    bombs: this.bombs
  });
}

Game.prototype.checkDeaths = function(){
  var deaths = false;
  for(var i = 0; i<this.playerCount; i++){
    var player = this.players[i];
    if(player.alive){
      var tile = player.getTile(this.tileHeight, this.tileWidth);
      if(this.blastTime[tile[0]][tile[1]]){
        player.alive = false;
        this.alive--;
        deaths = true;
      }
    }
  }
  if(deaths){
    for(var i = 0; i<this.playerCount; i++){
      var player = this.players[i];
      if(this.alive == 1 && player.alive){
        console.log("Player "+(player.index+1)+" won! ^__^");
      }
    }
  }
}

Game.prototype.checkBlasts = function(){
    for(var y = 0; y<this.map.height; y++){
      for(var x = 0; x<this.map.width; x++){
        if(this.clock - this.blastTime[y][x] > constants.BLAST_TIME){
          this.blastTime[y][x] = 0;
        }
      }
  }
}

Game.prototype.checkBombs = function(){
  var newBombs = [];
  for(var i = 0; i<this.bombs.length; i++){
    var bomb = this.bombs[i];
    var since = this.clock - bomb.time;
    if(since < constants.BOMB_BASE_TIME && !this.blastTime[bomb.y][bomb.x]){
      newBombs.push(bomb);
    } else {
      //boom!
      bomb.player.blast();
      this.blast(bomb);
    }
  }
  this.bombs = newBombs;
}

var sx = [0, 0, -1, 1];
var sy = [1, -1, 0, 0];

Game.prototype.blast = function(/*Bomb*/blast){
  blast.blast(this);
}

Game.prototype.movePlayers = function(){
  for(var i = 0; i<this.playerCount; i++){
    var player = this.players[i];
    var input = player.input;
    var dx = 0;
    var dy = 0;
    if(input.down){
      dy = constants.PLAYER_SPEED;
    } else if(input.up){
      dy = -constants.PLAYER_SPEED;
    } else if(input.left){
      dx = -constants.PLAYER_SPEED;
    } else if(input.right){
      dx = constants.PLAYER_SPEED;
    }
    if(dx || dy){
      this.tryMove(player, dy, dx);
    }
    if(input.bomb){
      this.bomb(player);
    }
  }
}

Game.prototype.bomb = function(/*Player*/player){
  console.log("Game.bomb() player "+player.index);
  if(player.canBomb()){
    console.log("Game.bomb() can bomb!");
    var playerPos = player.getTile();
    for(var i = 0; i<this.bombs.length; i++){
      if(this.bombs[i].y == playerPos[0] && this.bombs[i].x == playerPos[1]){
        return false;
      }
    }
    player.bomb();
    this.bombs.push(new bomb.Bomb(this.clock, playerPos[0], playerPos[1], player, player.bombType));
  }
}

Game.prototype.tryMove = function(/*Player*/player, /*Number*/dy, /*Number*/dx){
  var valid = true;
  var currentTile = player.getTile();
  player.move(dy, dx);
  if(player.x < 0 || player.y < 0 || player.x  + constants.PLAYER_SZ >= constants.GAME_SZ|| player.y + constants.PLAYER_SZ >= constants.GAME_SZ){
    valid = false;
  }
  var newTile = player.getTile();
  for(var y = 0; valid && y < this.map.height; y++){
    for(var x = 0; valid && x < this.map.width; x++){
      var tile = this.map.tiles[y][x];
      var rect = player.getBoundingBox();
      var other = tile.rectangle;
      var intersects = rect.intersects(other);
      if(!tile.walkable){
        if(intersects){
          valid = false;
        }
      } else if(newTile[0] == y && newTile[1] == x) {
        var hasBomb = false;
        for(var i = 0; i<this.bombs.length; i++){
          if(this.bombs[i].x == x && this.bombs[i].y == y) hasBomb = true;
        }
        if(hasBomb && (y != currentTile[0] || x != currentTile[1])){
          valid = false;
        }
      }
    }
  }
  if(!valid){
    player.move(-dy, -dx);
  }
}

exports.Game = Game;

