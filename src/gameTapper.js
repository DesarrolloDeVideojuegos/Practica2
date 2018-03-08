var sprites = {
    Beer: {
        sx: 512,
        sy: 99,
        w: 23,
        h: 32,
        frames: 1
      },
      Glass: {
        sx: 512,
        sy: 131,
        w: 23,
        h: 32,
        frames: 1
      },
      NPC: {
        sx: 512,
        sy: 66,
        w: 33,
        h: 33,
        frames: 1
      },
      ParedIzda: {
        sx: 0,
        sy: 0,
        w: 512,
        h: 480,
        frames: 1
      },
      Player: {
        sx: 512,
        sy: 0,
        w: 56,
        h: 66,
        frames: 1
      },
      TapperGameplay: {
        sx: 0,
        sy: 480,
        w: 512,
        h: 480,
        frames: 1
      }
   };
//---------------------------------------------------------------------
//      BACKGROUND
//---------------------------------------------------------------------
var bg = function(){
    this.setup("TapperGameplay",{x:0, y:0});
   
}

bg.prototype = new Sprite();

bg.prototype.step = function(){
    return;  
};

//---------------------------------------------------------------------
//      PLAYER
//---------------------------------------------------------------------

    //-----------------------------------------------------------------
    //      Player object
    //-----------------------------------------------------------------
    var playerMv = {
        0:{x:325, y:90},
        1:{x:357, y:185},
        2:{x:389, y:281},
        3:{x:421, y:377}

    }

    var player = function(){
        this.setup("Player", {x:325, y:90});
    }

    player.prototype = new Sprite();

    player.prototype.step = function(){
        if(Game.keys['right']) {this.x = }

        return;
    }

    //-----------------------------------------------------------------
    //      Player Layer
    //----------------------------------------------------------------

//---------------------------------------------------------------------
//      GAME
//---------------------------------------------------------------------
var startGame = function(){
    Game.setBoard(1, new bg());
    Game.setBoard(2, new playerLayer());
}

window.addEventListener("load", function() {
    Game.initialize("game",sprites,startGame);
  });

