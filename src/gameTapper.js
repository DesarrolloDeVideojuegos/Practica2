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
   
    Game.setBoard(3,new TitleScreen("YOU WIN", 
                                  "PRESS ENTER TO START PLAYING",
                                  playGame));
   
}
gameManager.prototype.loseGame = function(){
    
    Game.setBoard(3,new TitleScreen("YOU LOOSE", 
                              "PRESS ENTER TO START PLAYING",
                              playGame));


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
    Game.setBoard(3, new TitleScreen("TAPPER", "PRESS ENTER TO START PLAYING", playGame));
}

var playGame = function(){ 
    gm.nbeer = 0;
    gm.nclient = 0;
    let playerLayer = new GameBoard();
    Game.setBoard(2, playerLayer);

   for(let i = 0; i < 4; i++){
        playerLayer.add(new deadzone({x:playerMv[i].x + 12,y:playerMv[i].y}, OBJECT_GLASS | OBJECT_NPC));
        playerLayer.add(new deadzone({x:deadzonePos[i].x - 12, y:deadzonePos[i].y}, OBJECT_BEER));
    }

    playerLayer.add(new player("Player", playerMv[0]));
    playerLayer.add(new spawner(new client("NPC", clientMv[0]), 1, 1, 4));
    playerLayer.add(new spawner(new client("NPC", clientMv[1]), 2, 1, 3));
    playerLayer.add(new spawner(new client("NPC", clientMv[2]), 2, 3, 3));
    playerLayer.add(new spawner(new client("NPC", clientMv[3]), 4, 10, 2));
    playerLayer.add(new spawner(new client("NPC", clientMv[3], 10), 2, 1, 5));

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
    0:{x:112, y:79},
    1:{x:80, y:175},
    2:{x:48, y:271},
    3:{x:16, y:367} 
}

var client = function(sprite, pos, vx = 40){
    this.setup(sprite, {x: pos.x, y: pos.y, vx: vx});
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

var deadzonePos = {
    0:{x:112, y:90},
    1:{x:80, y:185},
    2:{x:48, y:281},
    3:{x:16, y:377} 
}
var deadzoneSize = {w:10,h:65}

var deadzone = function(pos, collisionMask, dimension = deadzoneSize){
    this.x = pos.x;
    this.y = pos.y;
    this.collisionMask = collisionMask;
    this.w = dimension.w;
    this.h = dimension.h;
}

deadzone.prototype.type = OBJECT_DEADZONE;
var canvas = document.getElementById("game");

deadzone.prototype.draw = function(){
   /* var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF2656"
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.stroke();*/
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

