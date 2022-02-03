var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var ground = height*5/6;

var board;
var boardWidth = width*1/6;
var boardHeight = 20

var tXf = 0;
var bXf = 0;
main();
function main() {
    board = new Board(width/2-boardWidth/2,boardWidth,boardHeight);
    loop();
}

function loop() {
    resizeCanvas();
    update();
    render();
    requestAnimationFrame(loop);
}

function resizeCanvas(){
	var can=document.getElementById('myCanvas');
	width = window.innerWidth;
	height = window.innerHeight; 
	can.width = window.innerWidth;
	can.height = window.innerHeight; 
}

function update() {
    board.update();
}

function render() {
    /*背景*/
    ctx.fillStyle = "#121212"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /*地板*/
    ctx.fillStyle = "#282828"
    ctx.fillRect(0,ground,canvas.width,canvas.height);
    /*檔板*/
    board.draw();
}

document.addEventListener("keydown", keydown, false);
document.addEventListener("keyup", keyup, false);
document.addEventListener("touchstart", touchstart, false);
document.addEventListener("touchend", touchend, false);
document.addEventListener("touchmove", touchmove, false);

function keydown(e) {
    console.log(e.keyCode)
    if(e.keyCode == 37)board.dir = -board.sp;
    if(e.keyCode == 39)board.dir = board.sp;
}

function keyup(e){
    board.dir = 0;
}

function touchstart(e){
    e.preventDefault();
    var touch = e.touches[0];
    // if (e.targetTouches.length == 1) board.shoot = 1;
    tXf = touch.pageX;
    pXf = board.x;
}

function touchend(e){
    e.preventDefault();
    board.dir = 0;
}

function touchmove(e){
    e.preventDefault();
    var touch = e.touches[0];
    tX = touch.pageX;
    tY = touch.pageY;
    tXm = tX-tXf;
    board.x = pXf + tXm;
}

function Board(x,w,h){
    this.x = x;
    this.y = ground-h/2;
    this.w = w;
    this.h = h;
    this.color = "#FFFF00"
    this.dir = 0;
    this.sp = 5
    this.draw = function(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.w,this.h)
    }
    this.update = function(){
        if(this.x >= 0 && this.x+this.w <= width)this.x += this.dir;
        else if (this.x+this.w > width)this.x = width-this.w;
        else if (this.x < 0)this.x = 0;
    }
}

function Ball(x,y,w,h){

}

function Obstacle(x,y,w,h){

}