var constants = require('./constants.js');

function Bomb(/*Number*/time, /*Number*/y, /*Number*/x, /*Player*/player, /*BombType*/type){
  this.time = time;
  this.y = y;
  this.x = x;
  this.type = type;
  this.player = player;
}

Bomb.prototype.blast = function(/*Game*/game){
  this.type(game, this);
}

var BombType = {
  noop: function(/*Game*/game, /*Bomb*/bomb){
  },
  cross: function(/*Game*/game, /*Bomb*/bomb){
    var x = bomb.x;
    var y = bomb.y;
    var strength = constants.BOMB_STRENGTH;
    function sub(/*Number*/dy,/*Number*/dx){
      for(var i = 0; i<=strength; i++){
        var nx = x + dx*i;
        var ny = y + dy*i;
        if(nx >= 0 && ny >= 0 && nx < game.map.width && ny < game.map.height){
          var status = game.map.tiles[ny][nx].blast();
          if(status[1]) game.blastTime[ny][nx] = game.clock;
          if(status[0]) break;
        }
      }
    }
    sub(0, -1);
    sub(0, 1);
    sub(1, 0);
    sub(-1, 0);
  }
};

exports.Bomb = Bomb;
exports.BombType = BombType;
