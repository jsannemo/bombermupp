function Map(/*Array[Array[String]]*/tiles, /*Array[Array[Number]]*/positions){
  this.tiles = tiles;
  this.positions = positions;
  this.height = tiles.length;
  this.width = tiles[0].length;
  for(var i = 0; i<this.height; i++){
    this.tiles[i] = this.tiles[i].split('');
  }
}

Map.tileToRect = function(/*Number*/y, /*Number*/x, /*Number*/tileHeight, /*Number*/tileWidth){
  return new Rect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
}

var map1 = new Map(
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
  
  [[0, 0], [10, 10], [10, 0], [0, 10]]
);