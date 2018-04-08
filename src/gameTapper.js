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
//      LIFES
//---------------------------------------------------------------------

var lifesNum = 3;
//Para sprite de cerveza
/*var lifesPos = {
    0:{x:250, y:300},
    1:{x:220, y:300},
    2:{x:280, y:300}
}*/
//Para sprite de player
var lifesPos = {
    0:{x:230, y:300},
    1:{x:160, y:300},
    2:{x:300, y:300}
}
var lifes = function(num){
    this.setup("Player", lifesPos[num]);
}
lifes.prototype = new Sprite();
lifes.prototype.step = function(){
    return;  
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
    console.log("Cervezas:", this.nbeer);
}
gameManager.prototype.rmBeer = function(){
    this.nbeer--;
    console.log("Cervezas:", this.nbeer);
    if(this.nbeer === 0 && this.nclient === 0)
        gm.winGame();
}
gameManager.prototype.addClients = function(num=1){
    this.nclient += num;
    console.log("Clientes:", this.nclient);
}
gameManager.prototype.rmClient = function(){
    this.nclient--;
    console.log("Clientes:", this.nclient);
    if(this.nbeer === 0 && this.nclient === 0)
        gm.winGame();
}
gameManager.prototype.winGame = function(){
    Game.setBoard(2, undefined);

    if(lvl === 3){
        Game.setBoard(3,new TitleScreen("CONGRATULATIONS!", "YOU ACHIEVED " + Game.points + " POINTS!", playGame));
        lvl = 1;
        Game.points = 0;
        lifesNum = 3;
    }else{
        Game.setBoard(3,new TitleScreen("YOU WIN THIS TIME!", "PRESS ENTER TO START THE NEXT DAY", playGame));
        lvl++;
    }

    let liveLayer = new GameBoard();
    Game.setBoard(5, liveLayer);
    for (i = 0; i < lifesNum; i++)
        liveLayer.add(new lifes(i));
}
gameManager.prototype.loseGame = function(){
    Game.setBoard(2, undefined);

    if(lifesNum === 1){
        Game.setBoard(3,new TitleScreen("YOU'RE FIRED!", "AT LEAST YOU GOT " + Game.points + " POINTS...", playGame));
        lvl = 1;
        Game.points = 0;
        lifesNum = 3;

    }else{
        Game.setBoard(3,new TitleScreen("OOPS! YOU LOSE!", "PRESS ENTER TO TRY AGAIN", playGame));
        lifesNum--;
    }

    let liveLayer = new GameBoard();
    Game.setBoard(5, liveLayer);
    for (i = 0; i < lifesNum; i++)
        liveLayer.add(new lifes(i));

}

//---------------------------------------------------------------------
//      GAME
//---------------------------------------------------------------------

var OBJECT_PLAYER = 1,
   OBJECT_BEER = 2,
   OBJECT_NPC = 4,
   OBJECT_DEADZONE = 8,
   OBJECT_GLASS = 16;

var lvl = 1;
var gm = new gameManager();

var startGame = function(){
    Game.setBoard(1, new bg());
    Game.setBoard(3, new TitleScreen("TAPPER", "PRESS ENTER TO START PLAYING", playGame));

    this.lifesNum = 3;
    let liveLayer = new GameBoard();
    Game.setBoard(5, liveLayer);
    for (i = 0; i < lifesNum; i++)
        liveLayer.add(new lifes(i));

    Game.setBoard(6,new GamePoints(0));
}

var playGame = function(){
    gm.nbeer = 0;
    gm.nclient = 0;
    Game.setBoard(5, undefined);

    let playerLayer = new GameBoard();
    Game.setBoard(2, playerLayer);

   for(let i = 0; i < 4; i++){
        playerLayer.add(new deadzone({x:playerMv[i].x + 12,y:playerMv[i].y}, OBJECT_GLASS | OBJECT_NPC));
        playerLayer.add(new deadzone({x:deadzonePos[i].x - 12, y:deadzonePos[i].y}, OBJECT_BEER | OBJECT_NPC));
    }
    playerLayer.add(new player("Player", playerMv[0]));

    /*playerLayer.add(new spawner(new client("NPC", clientMv[0]), 1, 1, 4));
    playerLayer.add(new spawner(new client("NPC", clientMv[1]), 2, 1, 3));
    playerLayer.add(new spawner(new client("NPC", clientMv[2]), 2, 3, 3));
    playerLayer.add(new spawner(new client("NPC", clientMv[3]), 4, 10, 2));
    playerLayer.add(new spawner(new client("NPC", clientMv[3], 10), 2, 1, 5));*/
    for (i = 0; i < levels[lvl].nS; i++){
        let barra = 3- (i % 4);  
        let vel = Math.floor(Math.random() * levels[lvl].mV) + 20  
        playerLayer.add(new spawner(new client("NPC", clientMv[barra], vel),
                                     levels[lvl].mC, levels[lvl].mO, levels[lvl].mF));
    }

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
        Game.points += 100;
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
    this.setup(sprite, {x:pos.x - 23, y:pos.y, vx:-40}); 
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
    this.setup(sprite, {x: pos.x, y: pos.y, vx: vx, timer:3, drinking:false});
}

client.prototype = new Sprite();
client.prototype.type = OBJECT_NPC;

client.prototype.step = function(dt){
    if(!this.drinking){
        this.x += dt * this.vx;
        let collision = this.board.collide(this,OBJECT_BEER);
        if(collision){
            collision.hit();
            //this.board.remove(this);
            //gm.rmClient();
            Game.points += 50;
            this.drinking = true;
        }
    }
    else{
        this.timer -= dt;
        this.x += dt * -50;
        if(this.timer <= 0){
            this.drinking = false; 
            this.timer = 3;           
        } 
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
        if(collision instanceof client && collision.drinking)
            gm.rmClient();
        else
            gm.loseGame();
        this.board.remove(collision);
    }
}


//---------------------------------------------------------------------
//      SPAWNER
//---------------------------------------------------------------------

var spawner = function(client, num, offset, frec){
    this.client = client;
    this.num = Math.floor(Math.random() * num) + 1;
    this.maxFrec = Math.floor(Math.random() * (frec*2)) + frec;
    this.actFrec = 0;
    this.offset = Math.floor(Math.random() * (offset*lvl)) + 1;

    gm.addClients(this.num);
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

//---------------------------------------------------------------------
//      Levels
//---------------------------------------------------------------------

//numLevel:{numSpawn, maxClient, maxVel, maxOffset, minFrec}
var levels = {
    1:{nS:4, mC:2, mV:30, mO:6, mF:7},
    2:{nS:4, mC:2, mV:40, mO:6, mF:5},
    3:{nS:6, mC:3, mV:40, mO:5, mF:9}
}


window.addEventListener("load", function() {
    Game.initialize("game",sprites,startGame);
  });

