var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var ground = height*2/3;

var player;
var obstacle;
var hvObs = false;
main();

function main() {
    player = new Player(10,ground-200,125,200)
    var obstacleH = getRnd(50,200);
    obstacle = new Obstacle(width,ground-obstacleH,60,obstacleH);
    loop();
}

function getRnd(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}
function loop() {
	resizeCanvas();
    update();
    render();
    requestAnimationFrame(loop);//16ms 60FPS
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
    /*debug顯示用*/
    // var str = "["+Math.round(player.y)+","+ground+"]";
    // drawString(ctx, str, width / 2, height / 2, "#FF0", 40, "Consolas", 0, "center", 1);
    /*背景*/
    let radgrad = ctx.createRadialGradient(canvas.width/2, 0, 0, canvas.width/2, 0, canvas.height*1.25);
    radgrad.addColorStop(0, '#2C5364');
    radgrad.addColorStop(1, '#0F2027');
    ctx.fillStyle = radgrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /*地板*/
    ctx.fillStyle = "#121212"
    ctx.fillRect(0,canvas.height*2/3,canvas.width,canvas.height);
    /*玩家*/
    player.draw();
    /*障礙*/
    obstacle.draw();
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

    this.update = function(){
        if(this.jump == 1)this.jumping();
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
        if( this.y > ground-200)this.y = ground-200;
    }

    this.color = "#FFFFFF"
    this.draw = function(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.w,this.h)
    }
}

function Obstacle(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.m = 0;

    this.update = function(){
        if(this.x+87 > 0)this.x-=7;
        else{
            var obstacleH = getRnd(50,200);
            obstacle = new Obstacle(width,ground-obstacleH,60,obstacleH)
        }
    }

    this.color = "#E83015"
    this.draw = function(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.w,this.h)
    }


}