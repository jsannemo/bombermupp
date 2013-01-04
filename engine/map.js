var constants = require('./constants.js');
var Rectangle = require('./rectangle.js').Rectangle;

function Map(/*MapType*/mapType){
  var tiles = mapType.tiles;
  this.positions = map.positions;
  this.height = tiles.length;
  this.width = tiles[0].length;
  
  this.tiles = new Array(this.height);
  for(var i = 0; i<this.height; i++){
    this.tiles[i] = new Array(this.width);
    for(var j = 0; j<this.width; j++){
      this.tiles[i][j] = TileType[tiles[i][j]](i, j);
    }
  }
}

function Tile(/*Number*/y, /*Number*/x, /*Boolean*/walkable, /*Function*/blast, /*String*/color){
  this.y = y;
  this.x = x;
  this.walkable = walkable;
  this.blast = blast;
  this.rectangle =  new Rectangle(x*constants.TILE_SZ, y*constants.TILE_SZ, constants.TILE_SZ, constants.TILE_SZ);
  this.color = color;
}

/**
 * Return an array with the tiles blast status:
 * blast[0] = did this tile stop the blast?
 * blast[1] = did this tile blow up?
 */
Tile.prototype.blast = function(){
  return this.blast();
}

// Tile types
function Ground(/*Number*/y, /*Number*/x){
  return new Tile(y, x, true, function(){ return [false, true]; }, "#855513");
}

function Metal(/*Number*/y, /*Number*/x){
  return new Tile(y, x, false, function() { return [true, false]; }, "#4A4A4A");
}

function Earth(/*Number*/y, /*Number*/x){
  return new Tile(y, x, false, function(){
    if(this.walkable){
      return [false, true];
    } else {
      this.color = "#614229";
      this.walkable = true;
      return [true, true];
    }
  }, "#BAB2A8");
}

var TileType = {
  '.': Ground,
  'x': Earth,
  '#': Metal
};

exports.Map = Map;

exports.Maps = [
  {
    name:"Map 1",
    tiles: 
    ["..xxxxxxx..",
    ".#x#x#x#x#.",
    "xxxxxxxxxxx",
    "x#x#x#x#x#x",
    "xxxxxxxxxxx",
    "x#x#x#x#x#x",
    "xxxxxxxxxxx",
    "x#x#x#x#x#x",
    "xxxxxxxxxxx",
    ".#x#x#x#x#.",
    "..xxxxxxx.."],
    positions: [[0, 0], [10, 10], [10, 0], [0, 10]]
  }
];