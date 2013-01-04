function drawAll(/*Object*/game){
  drawBackground(game);
  drawTiles(game);
  drawPlayers(game);
  drawBombs(game);
}

function drawBackground(/*Object*/game){
  var ctx = game.ctx;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, game.GAME_SZ, game.GAME_SZ)
}

function drawTiles(/*Game*/game){
  var ctx = game.ctx;
  var tileHeight = game.TILE_SZ;
  var tileWidth = game.TILE_SZ;
  for(var i = 0; i<game.tiles.length; i++){
    var tile = game.tiles[i];
    ctx.fillStyle = tile.blast ? "#FF0000" : tile.color;
    ctx.fillRect(tile.x*tileWidth, tile.y*tileHeight, game.TILE_SZ, game.TILE_SZ); //TODO: ahem..
  }
}

var playerColors = ["#030B82", "#820303", "#038203", "#DBDB2A"];

function drawPlayers(/*Game*/game){
  var ctx = game.ctx;
  for(var i = 0; i<game.players.length; i++){
    var player = game.players[i];
    if(!player.alive) continue;
    ctx.beginPath();
    ctx.fillStyle = playerColors[i];
    ctx.arc(player.x, player.y, game.PLAYER_SZ, 0, 2*Math.PI, false);
    ctx.fill();
  }
}

function drawBombs(/*Game*/game){
  var tileHeight = game.TILE_SZ;
  var tileWidth = game.TILE_SZ;
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