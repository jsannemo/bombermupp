window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

function Game(/*HTMLCanvasElement*/canvas, /*Map*/map){
  this.ctx = canvas.getContext('2d');
  this.drawWidth = GAME_WIDTH;
  this.drawHeight = GAME_HEIGHT;
  this.map = map;
  this.height = map.height;
  this.width = map.width;
  this.tileHeight = this.drawHeight/this.height;
  this.tileWidth = this.drawWidth/this.width;
  this.players = [];
  this.bombs = [];
  this.blastTime = new Array(this.height);
  for(var i = 0; i<this.height; i++){
    this.blastTime[i] = new Array(this.width);
    for(var j = 0; j<this.width; j++){
      this.blastTime[i][j] = 0;
    }
  }
}

Game.prototype.start = function(){
  this.clock = Date.now();
  this.initPlayers();
  this.tick();
}

Game.prototype.initPlayers = function(){
  var players;
  do {
    players = parseInt(prompt("How many players? [2-4]"));
  } while(isNaN(players) || players < 1 || players > 4);
  this.playerCount = players;
  this.alive = players;
  var positions = this.map.positions;
  for(var i = 0; i<this.playerCount; i++){
    var realX = (positions[i][1] + (1 - PLAYER_FACTOR)/2)*this.tileWidth;
    var realY = (positions[i][0] + (1 - PLAYER_FACTOR)/2)*this.tileHeight;
    var controls = PLAYER_CONTROLS[i];
    var input = new Input(controls[0], controls[1], controls[2], controls[3], controls[4]);
    this.players.push(new Player(realY, realX, i, input, this.tileHeight*PLAYER_FACTOR, this.tileWidth*PLAYER_FACTOR));
  }
}

Game.prototype.tick = function(){
  var game = this;
  window.requestAnimationFrame(function callback(){
    game.tick();
  });
  var currentTime = Date.now();
  if(currentTime - game.clock > 16.66666666666666){
    this.checkBombs();
    this.checkBlasts();
    this.checkDeaths();
    this.movePlayers();
    game.clock = currentTime;
  }
  draw(this);
}

Game.prototype.checkDeaths = function(){
  var deaths = false;
  for(var i = 0; i<this.playerCount; i++){
    var player = this.players[i];
    if(player.alive){
      var tile = player.tile(this.tileHeight, this.tileWidth);
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
        alert("Player "+(player.index+1)+" won! ^__^");
      }
    }
  }
}

Game.prototype.checkBlasts = function(){
    for(var y = 0; y<game.height; y++){
    for(var x = 0; x<game.width; x++){
      if(game.clock - game.blastTime[y][x] > BLAST_TIME){
        game.blastTime[y][x] = 0;
      }
    }
  }
}

Game.prototype.checkBombs = function(){
  var newBombs = [];
  for(var i = 0; i<this.bombs.length; i++){
    var bomb = this.bombs[i];
    var since = game.clock - bomb.time;
    if(since < BOMB_BASE_TIME){
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
  var y = blast.y;
  var x = blast.x;
  var radius = BOMB_RADIUS;
  for(var i = 0; i<4; i++){
    this.subBlast(y, x, sy[i], sx[i], radius);
  } 
}

Game.prototype.subBlast = function(/*Number*/y, /*Number*/x, /*Number*/dy, /*Number*/dx, /*Number*/radius){
  for(var i = 0; i<=radius; i++){
    var ny = y + i*dy;
    var nx = x + i*dx;
    if(ny < 0 || nx < 0 || ny >= this.height || nx >= this.width) break;
    var tile = this.map.tiles[ny][nx];
    if(tile == "#") break;
    this.blastTime[ny][nx] = this.clock;
    if(tile == "x"){
      this.map.tiles[ny][nx] = '.';
      console.log("blast after "+this.map.tiles[ny][nx]);
      break;
    }
  }
}

Game.prototype.movePlayers = function(){
  for(var i = 0; i<this.playerCount; i++){
    var player = this.players[i];
    var input = player.input;
    var dx = 0;
    var dy = 0;
    if(input.down){
      dy = PLAYER_SPEED;
    } else if(input.up){
      dy = -PLAYER_SPEED;
    } else if(input.left){
      dx = -PLAYER_SPEED;
    } else if(input.right){
      dx = PLAYER_SPEED;
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
    player.bomb();
    var playerPos = player.tile(this.tileHeight, this.tileWidth);
    this.bombs.push(new Bomb(this.clock, playerPos[0], playerPos[1], player));
  }
}

Game.prototype.tryMove = function(/*Player*/player, /*Number*/dy, /*Number*/dx){
  var valid = true;
  player.move(dy, dx);
  if(player.x < 0 || player.y < 0 || player.x + player.width >= game.drawWidth || player.y + player.height >= game.drawHeight){
    console.log("Game.tryMove() out of bounds");
    valid = false;
  }
  for(var y = 0; y<game.height; y++){
    for(var x = 0; x<game.width; x++){
      var tile = this.map.tiles[y][x];
      var rect = player.rect();
      if(tile != '.'){
        var other = Map.tileToRect(y, x, this.tileHeight, this.tileWidth);
        if(rect.intersects(other)){
          
          console.log("Game.tryMove() intersection between "+rect.str()+" and "+other.str()+" obstacle at "+y+" "+x);
          valid = false;
          break;
        }
      }
    }
  }
  if(!valid){
    player.move(-dy, -dx);
  }
}


/* DRAWING */
function draw(/*Game*/game){
  drawBg(game);
  drawTiles(game);
  drawBlast(game);
  drawBombs(game);
  drawPlayers(game);
}

function drawBg(/*Game*/game){
  var ctx = game.ctx;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, game.drawWidth, game.drawHeight);
}

//Blank tile: '.'
//Soft tile: 'x'
//Hard tile: '#'

function drawTiles(/*Game*/game){
  for(var y = 0; y<game.height; y++){
    for(var x = 0; x<game.width; x++){
      var tile = game.map.tiles[y][x];
      drawTile(game, tile, y, x);
    }
  }
}

function drawTile(/*Game*/game, /*String*/tile, /*Number*/y, /*Number*/x){
  var ctx = game.ctx;
  var tileHeight = game.tileHeight;
  var tileWidth = game.tileWidth;
  switch(tile){
    case '.':
      ctx.fillStyle = "#855513";
      break;
    case 'x':
      ctx.fillStyle = "#BAB2A8";
      break;
    case '#':
      ctx.fillStyle = "#4A4A4A";
      break;
    default:
      console.log("Bad tile: "+tile);
  }
  ctx.fillRect(x*tileWidth, y*tileHeight, tileWidth-0.3, tileHeight-0.3); //TODO: ahem..
}

var playerColors = ["#030B82", "#820303", "#038203", "#DBDB2A"];

function drawPlayers(/*Game*/game){
  var tileHeight = game.tileHeight;
  var tileWidth = game.tileWidth;
  var ctx = game.ctx;
  for(var i = 0; i<game.playerCount; i++){
    var player = game.players[i];
    if(!player.alive) continue;
    ctx.fillStyle = playerColors[i];
    ctx.fillRect(player.x, player.y, player.width , player.height);
  }
}

function drawBombs(/*Game*/game){
  var tileHeight = game.tileHeight;
  var tileWidth = game.tileWidth;
  var ctx = game.ctx;
  for(var i = 0; i<game.bombs.length; i++){
    var bomb = game.bombs[i];
    var radius = Math.min(tileHeight*0.4, tileWidth*0.4);
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.arc((bomb.x + 0.5)*tileWidth, (bomb.y + 0.5)*tileHeight, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}

function drawBlast(/*Game*/game){
  var tileHeight = game.tileHeight;
  var tileWidth = game.tileWidth;
  var ctx = game.ctx;
  ctx.fillStyle = "#FF0000";
  for(var y = 0; y<game.height; y++){
    for(var x = 0; x<game.width; x++){
      if(game.blastTime[y][x] != 0){
        ctx.fillRect(x*tileWidth, y*tileHeight, tileHeight, tileWidth);
      }
    }
  }
} 

var game = new Game(document.getElementById("bomber"), map1);
game.start();