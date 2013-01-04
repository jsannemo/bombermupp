var mime = require('mime');
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var io = require('socket.io');

var app = http.createServer(function (req, res) {
  var urlPath = url.parse(req.url).pathname;
  if(urlPath == '/'){
    urlPath = "index.html";
  }
  var filename = process.cwd();
  filename = path.join(filename, "client");
  filename = path.join(filename, urlPath);
  console.log("Serving "+filename);
  fs.readFile(filename, "UTF-8", function (err,data) {
    if (err) {
      res.writeHead(404, {"Content-Type":"text/plain"});
      res.end("File not found");
    } else {
      res.writeHead(200, {"Content-Type": mime.lookup(filename)});
      var filestream = fs.createReadStream(filename);
      filestream.pipe(res);
    }
  });
}).listen(9501, "0.0.0.0");

var websocket = io.listen(app);

var constants = require("./engine/constants.js");
var game = require("./engine/game.js");
var map = require("./engine/map.js");
var Input = require("./engine/input.js").Input;

var queue = [];

websocket.set('log level', 1);
websocket.sockets.on("connection", function(socket){
  console.log("Client connect");
  
  socket.on("init", function(data){
    socket.emit("settings", {
      GAME_SZ: constants.GAME_SZ,
      PLAYER_SZ: constants.PLAYER_SZ,
      TILE_SZ: constants.TILE_SZ
    });
    queue.push(socket);
    if(queue.length == 2){
      startGame();
    }
  });
  
  socket.on("disconnect", function(){
    
  });
  
});

function startGame(){
  var players = queue;
  queue = [];
  var inputs = [];
  var inputMap = {};
  for(var i = 0; i<players.length; i++){
    var socket = players[i];
    var input = new Input();
    (function(inp, sock){
      sock.on("input", function(data){
        inp.left = data.left || false;
        inp.up = data.up || false;
        inp.right = data.right || false;
        inp.down = data.down || false;
        inp.bomb = data.bomb || false;
    });
    })(input, socket);
    inputs.push(input);
    socket.emit("controls", {controls: constants.PLAYER_CONTROLS[i]});
  }
  var mapType = map.Maps[0];
  var gameMap = new map.Map(mapType[0], mapType[1]);
  var theGame = new game.Game(inputs, gameMap, players);
  console.log("Game setup");
  theGame.start();
}