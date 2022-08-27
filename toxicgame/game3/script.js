var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;
var ground = height*5/6;
var started = false;

var board;
var boardWidth = width*1/6;
var boardHeight = 20

var startline;
var startlineW = 5;
var startlineL = 100;

var tXf = 0;
var bXf = 0;
main();
function main() {
    board = new Board(width/2-boardWidth/2,boardWidth,boardHeight);
    startline = new StartLine(width/2,ground-boardHeight/2+5,startlineW,startlineL)
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
    startline.update();
}

function render() {
    /*背景*/
    ctx.fillStyle = "#08192D"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /*地板*/
    ctx.fillStyle = "#282828"
    ctx.fillRect(0,ground,canvas.width,canvas.height);
    /*起線*/
    
    /*檔板*/
    board.draw();
    /*debug用*/
    // drawString(ctx, secpoint(0,0,0,0)[1]+"", width / 2, height / 2, "#FF0", 100, "Arial", 0, "center", 1);
    startline.draw();
}

/*滑鼠移動*/
document.addEventListener("mousemove", e =>{
    if(started)board.x = e.offsetX - boardWidth/2;
    startline.x = e.offsetX;
    startline.y = e.offsetY;
})
/*螢幕滑動*/
document.addEventListener("touchstart", e =>{
    e.preventDefault();
    var touch = e.touches[0];
    tXf = touch.pageX;
    pXf = board.x;
});
document.addEventListener("touchend", e =>{
    e.preventDefault();
    board.dir = 0;
});
document.addEventListener("touchmove", e =>{
    e.preventDefault();
    var touch = e.touches[0];
    tX = touch.pageX;
    tY = touch.pageY;
    tXm = tX-tXf;
    board.x = pXf + tXm;
});

function Board(x,w,h){
    this.x = x;
    this.y = ground-h/2;
    this.w = w;
    this.h = h;
    this.color = "#FFFF00";
    this.dir = 0;
    this.sp = 5;
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

function StartLine(x,y,w,l){
    this.w = w;
    this.l = l;
    this.x = x;
    this.y = y + this.l;
    this.color = "#FFFFFF";
    this.m = 0;

    this.draw = function(){
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.w;
        // ctx.beginPath();
        // ctx.moveTo(x,y);
        // // ctx.lineTo(x+l,y);
        // ctx.lineTo(this.x,this.y);
        // ctx.stroke();
        // ctx.closePath();

        ctx.save();
        ctx.translate(0,0);
        ctx.rotate(0 * Math.PI/180);
        ctx.lineWidth = this.w;
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(this.x,this.y);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

    }

    this.update = function(){
        this.m = (this.y-y)/(this.x-x);
    }
}

function Ball(x,y,w,h){

}

function lenth(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
}

function secpoint(x,y,l,m){
    return [1,2];
}