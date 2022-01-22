var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var ground = height*2/3;
var point = 0;

var player;
var obstacle;
var hvObs = false;

var playerW = 87;
var playerH = 200;
var obstacleW = 0;
var obstacleH = 0;
var obstacleHMax = 100;
var obstacleHMin = 40;
var obstacleWMax = 80;
var obstacleWMin = 40;
var obstacleSpeed = 7;
main();

function main() {
    player = new Player(0,ground-playerH,playerW,playerH)
    addObs();
    loop();
}

function getRnd(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}
function loop() {
	resizeCanvas();
    update();
    render();
    if(player.dead){
        drawString(ctx, "G A M E  O V E R\n Point:"+player.point, width / 2, height / 2, "#FF0", 40, "Consolas", 0, "center", 1);
        return;
    }
    requestAnimationFrame(loop);
    /*debug顯示用*/
}

function resizeCanvas(){
	var can=document.getElementById('myCanvas');
	width = window.innerWidth;
	height = window.innerHeight; 
	can.width = window.innerWidth;
	can.height = window.innerHeight; 
}

function update() {
    player.update();
    obstacle.update();
}

function render() {
    
    /*背景*/
    ctx.fillStyle = "#121212"
    // let radgrad = ctx.createRadialGradient(canvas.width/2, 0, 0, canvas.width/2, 0, canvas.height*1.25);
    // radgrad.addColorStop(0, '#2C5364');
    // radgrad.addColorStop(1, '#0F2027');
    // ctx.fillStyle = radgrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /*地板*/
    ctx.fillStyle = "#282828"
    ctx.fillRect(0,canvas.height*2/3,canvas.width,canvas.height);
    /*玩家*/
    player.draw();
    /*障礙*/
    obstacle.draw();
    /*碰撞*/
    player.touched();
    /*分數*/
    if(!player.dead)drawString(ctx, player.point+"", width / 2, height / 2, "#FF0", 40, "Consolas", 0, "center", 1);
    /*速度*/
    if(player.point%100==0)obstacleSpeed+=0.1;
}

document.addEventListener("keydown", keydown, false);
document.addEventListener("touchstart", touchstart, false);

function keydown(e) {
    if (e.keyCode == 32) player.jump = 1;
}

function touchstart(e){
    e.preventDefault();
    var touch = e.touches[0];
    if (e.targetTouches.length == 1) player.jump = 1;
}

function Player(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.m = 0;

    this.jump = 0;
    this.power = 17;
    this.speed = 35;
    this.jumpMax=this.power*100;

    this.dead = false;
    this.point = 0;
    this.update = function(){
        if(this.jump == 1)this.jumping();
        point++;
        this.point=Math.round(point/10);
        // this.isDead();
    }
    
    this.jumping = function(){
        if( this.m < this.jumpMax){
            this.y-=this.power*Math.sin(this.m/this.jumpMax*Math.PI*2 );
            if( this.y < 0)this.y=0;
            this.m+=this.speed;
        }else{
            this.jump=0;
            this.m=0;
        }
        if( this.y > ground-playerH)this.y = ground-playerH;
    }

    this.color = "#FFFFFF"
    this.draw = function(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.w,this.h)
    }

    this.touched = function(){
        if(obstacle.x<(player.x+playerW)&&(obstacle.x+obstacleW)>0 && obstacle.y<(player.y+playerH))
            this.dead = true;
        else this.dead = false;
    }
}

function Obstacle(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.m = 0;

    this.update = function(){
        if(this.x+obstacleW > 0)this.x-=obstacleSpeed;
        else{
            addObs()
        }
    }

    this.color = "#E83015"
    this.draw = function(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.w,this.h)
    }
}

function addObs(){
    obstacleH = getRnd(obstacleHMin,obstacleHMax);
    obstacleW = getRnd(obstacleWMin,obstacleWMax);
    obstacle = new Obstacle(width,ground-obstacleH,obstacleW,obstacleH);
}