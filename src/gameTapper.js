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
//      GAMEMANAGER
//---------------------------------------------------------------------

var gameManager = function(){
    this.nbeer = 0;
    this.nclient = 0;
}

gameManager.prototype.addBeer = function(){
    this.nbeer++;
}
gameManager.prototype.rmBeer = function(){
    this.nbeer--;
    if(this.nbeer === 0 && this.nclient === 0)
        gm.winGame();
}
gameManager.prototype.addClients = function(num=1){
    this.nclient += num;
}
gameManager.prototype.rmClient = function(){
    this.nclient--;
}
gameManager.prototype.winGame = function(){
    Game.setBoard(4,new TitleScreen("YOU WIN", 
                                  "PRESS ENTER TO START PLAYING",
                                  startGame));
}
gameManager.prototype.loseGame = function(){
    Game.setBoard(4,new TitleScreen("YOU LOOSE", 
                              "PRESS ENTER TO START PLAYING",
                              startGame));

}

//---------------------------------------------------------------------
//      GAME
//---------------------------------------------------------------------

var OBJECT_PLAYER = 1,
   OBJECT_BEER = 2,
   OBJECT_NPC = 4,
   OBJECT_DEADZONE = 8,
   OBJECT_GLASS = 16;

var aux = 0;
var gm = new gameManager();
var startGame = function(){
    Game.setBoard(1, new bg());
    let playerLayer = new GameBoard();
    Game.setBoard(2, playerLayer);
    playerLayer.add(new deadzone({x:playerMv[0].x + 12,y:playerMv[0].y}, {w:10,h:65}, 
                    OBJECT_GLASS | OBJECT_NPC));
    playerLayer.add(new deadzone({x:clientMv[0].x - 12, y:clientMv[0].y}, {w:10,h:65}, OBJECT_BEER));
    playerLayer.add(new player("Player", playerMv[0]));
    //playerLayer.add(new beer("Beer", playerMv[0]));
    playerLayer.add(new spawner(new client("NPC", clientMv[0]), 3, 5, 2));

    Game.setBoard(3, new bw());
}

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
//      BARWALL
//---------------------------------------------------------------------
var bw = function(){
    this.setup("ParedIzda",{x:0, y:0});
   
}

bw.prototype = new Sprite();

bw.prototype.step = function(){
    return;  
};
//---------------------------------------------------------------------
//      PLAYER
//---------------------------------------------------------------------

var playerMv = {
    0:{x:325, y:90},
    1:{x:357, y:185},
    2:{x:389, y:281},
    3:{x:421, y:377}

}

var player = function(sprite, pos){
    this.setup(sprite, {x:pos.x, y:pos.y, pos:0});
    
}

player.prototype = new Sprite();
player.prototype.type = OBJECT_PLAYER;

player.prototype.step = function(){
    if(Game.keys["up"]){
        this.pos = (3 + this.pos ) % 4;
        Game.keys["up"] = undefined;
    }
    if(Game.keys["down"]){
        this.pos = (this.pos + 1) % 4;
        Game.keys["down"] = undefined;
    }
    if(Game.keys["space"]){
        this.board.add(new beer("Beer", playerMv[this.pos]));
        Game.keys["space"] = undefined;
    }
    let collision = this.board.collide(this, OBJECT_GLASS);
    if(collision){
        this.board.remove(collision);
        gm.rmBeer();
    }
    this.x = playerMv[this.pos].x;
    this.y = playerMv[this.pos].y;
};

//---------------------------------------------------------------------
//      BEER
//---------------------------------------------------------------------

var beer = function(sprite, pos){
    this.setup(sprite, {x:pos.x - 23, y:pos.y, vx:-30}); 
    gm.addBeer();
}

beer.prototype = new Sprite();
beer.prototype.type = OBJECT_BEER;

beer.prototype.step = function(dt){
    this.x += dt * this.vx;
    return;
}

beer.prototype.hit = function(){
    this.sprite = "Glass";
    this.vx = -this.vx;
    this.type = OBJECT_GLASS;
}

//---------------------------------------------------------------------
//      CLIENT
//---------------------------------------------------------------------

var clientMv = {
    0:{x:125, y:90},
    1:{x:87, y:185},
    2:{x:59, y:281},
    3:{x:25, y:377} 
}

var client = function(sprite, pos){
    this.setup(sprite, {x: pos.x, y: pos.y, vx: 40});
}

client.prototype = new Sprite();
client.prototype.type = OBJECT_NPC;

client.prototype.step = function(dt){
    this.x += dt * this.vx;
    let collision = this.board.collide(this,OBJECT_BEER);
    if(collision){
        collision.hit();
        this.board.remove(this);
        gm.rmClient();
    }
    return;
}

//---------------------------------------------------------------------
//      DEADZONE
//---------------------------------------------------------------------

var deadzone = function(pos, dimension, collisionMask){
    this.x = pos.x;
    this.y = pos.y;
    this.w = dimension.w;
    this.h = dimension.h;
    this.collisionMask = collisionMask;

}
deadzone.prototype.type = OBJECT_DEADZONE;
var canvas = document.getElementById("game");

deadzone.prototype.draw = function(){
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF2656"
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.stroke();
}

deadzone.prototype.step = function(){
    let collision = this.board.collide(this, this.collisionMask);
    if(collision){
        this.board.remove(collision);
        gm.loseGame();
    }
}

//---------------------------------------------------------------------
//      SPAWNER
//---------------------------------------------------------------------

var spawner = function(client, num, offset, frec){
    this.client = client;
    this.num = num;
    this.maxFrec = frec;
    this.actFrec = 0;
    this.offset = offset;
    gm.addClients(num);
}

spawner.prototype.draw = function(){
    return;
}

spawner.prototype.step = function(dt){
    if(this.offset <= 0){
        if(this.actFrec <= 0){
            this.board.add(Object.create(this.client));
            this.actFrec = this.maxFrec;
            if(--this.num === 0)
                this.board.remove(this);
        }
        else
            this.actFrec -= dt;
    }
    else
        this.offset -= dt;
}

window.addEventListener("load", function() {
    Game.initialize("game",sprites,startGame);
  });

