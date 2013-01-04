var mime = require('mime');
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var io = require('socket.io');
var crypto = require('crypto');

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

var games = {};
var socketGames = {};

//websocket.set('log level', 1);
websocket.sockets.on("connection", function(socket){
  console.log("Client connect");
  
  socket.emit("maps", { mapData: map.Maps });
  console.log("Sent maps to client");
  
  socket.on("create-game", function(data){
    createGame(socket, data);
  });
  
  socket.on("join-game", function(data){
    joinGame(socket, data.token);
  });
  
  socket.on("disconnect", function(){
    var gameId = socketGames[socket];
    if(gameId){
      delete socketGames[socket];
      var game = games[gameId];
      if(game){
        if(game.admin == socket){
          for(var i = 0; i<game.players.length; i++){
            game.players[i].emit("room-closed", {msg: "The room creator left"});
          }
          delete games[gameId];
        } else {
          var newPlayers = [];
          for(var i = 0; i < game.players.length; i++){
            if(game.players[i] != socket){
              newPlayers.push(game.players[i]);
            }
          }
          game.players = newPlayers;
          for(var i = 0; i < game.players.length; i++){
            sendGameInfo(game.players[i], gameId);
          }
        }
      }
    }
  });
});

function joinGame(socket, token){
  if(!games[token]){
    socket.emit("join-error", {msg: "The room doesn't exist'"});
  } else {
    var game = games[token];
    if(game.players.length == game.max){
      socket.emit("join-error", {msg: "The room is full"});
      return;
    }
    game.players.push(socket);
    socketGames[socket] = token;
    socket.emit("join", {token: token});
    for(var i = 0; i < game.players.length; i++){
      sendGameInfo(game.players[i], token);
    }
  }
}

function sendGameInfo(socket, token){
  var game = games[token];
  if(game){
    socket.emit("game-info", {token: token, players: game.players.length, max: game.max, map: game.map});
  }
}

function createGame(socket, data){
  var players = parseInt(data.players, 10);
  if(isNaN(players) || players < 2 || players > 4){
    socket.emit("create-game-error", {msg: "Enter an integer between 2-4"});
  }
  var mapId = parseInt(data.map, 10);
  if(isNaN(mapId) || mapId < 0 || mapId >= map.Maps.length){
    socket.emit("create-game-error", {msg: "Choose a map"});
  }
  var public = Boolean(data.public);
  console.log("Create room with", players, "players, map", mapId, "public?", public);
  crypto.randomBytes(10, function(ex, buf) {
    var token = buf.toString('hex');
    games[token] = {
      max: players,
      public: public,
      map: mapId,
      admin: socket,
      players: []
    };
    socketGames[socket] = token;
    joinGame(socket, token);
  });
}