var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight;

var x = 0, y = 0;
var player;//弧度
var enemies = [];
var bullet = [];

var wavenum = 0;
var waveStartTime = 0;
var waveDelay = 2000;
main();

function main() {
    //load
    console.log("Start");
    player = new Player(width / 2, height / 2 + 40, 20);

    loop();

}


function loop() {
	resizeCanvas();
    update();
    render();
    if (player.hp == 0) {
        var str = "G A M E  O V E R\n Point:" + player.score + " Press F5 "
        drawString(ctx, str, width / 2, height / 2, "#FF0", 40, "Consolas", 0, "center", 1);
        return;
    }
    requestAnimationFrame(loop);//16ms 60FPS
}

function resizeCanvas(){
		var can=document.getElementById('myCanvas');
		/* canvas.setAttribute('width',window.innerWidth);
		canvas.setAttribute('height',window.innerHeight); */
		width = window.innerWidth;
		height = window.innerHeight; 
		can.width = window.innerWidth;
		can.height = window.innerHeight; 
}

function update() {


    if (waveStartTime == 0 && enemies.length == 0) {
        wavenum++;
        waveStartTime = new Date().getTime();
    }
    else if (new Date().getTime() - waveStartTime > waveDelay) {
        waveStartTime = 0;
    }
    if (waveStartTime == 0 && enemies.length == 0) {
        for (var i = 0; i < wavenum + 2; i++) {
            enemies.push(new Enemy());
        }

    }
    player.update();
    for (var i = 0; i < bullet.length; i++) {
        bullet[i].update();
    }
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }
    for (var i = 0; i < bullet.length; i++) {
        for (var j = 0; j < enemies.length; j++) {
            if (getDist(bullet[i], enemies[j])) {
                enemies[j].hit(1);
                bullet.splice(i, 1);
                i--;
                break;
            }
        }
    }

    for (var j = 0; j < enemies.length; j++) {
        if (getDist(player, enemies[j])) {
            player.hit(1);
        }
    }
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].dead) {
            enemies.splice(i, 1);
            player.score += 2;
            i--;
            break;
        }
    }

}

function render() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //---------------------------------------
    player.render();
    for (var i = 0; i < bullet.length; i++) {
        bullet[i].render();
    }
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].render();
    }
    if (waveStartTime > 0) {
        var x = width / 2;
        var y = height / 2;
        var timeDiff = getNow() - waveStartTime;
        var alpha = Math.sin(Math.PI * timeDiff / waveDelay);
        var color = "rgba(255,0,0, " + alpha + " )";
        var str = "－ W A V E " + wavenum + " －";
        drawString(ctx, str, x, y, color, 40, "Consolas", 0, "center", 1);
    }
    if (player.hp == 0) return;
    var str = "Point: " + player.score + "";
    drawString(ctx, str, width * 4 / 5, 60, "#FFF", 30, "Consolas", 0, "center", 1);

    for (var i = 0; i < player.hp; i++) {
        var r = 10;
        var offx = 20;
        var x = i * r * 2 * 1.5 + r + offx;
        var y = 40;
        ctx.fillStyle = "#F00";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

    }
}


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//event
document.addEventListener("keydown", keydown, false);//註冊按下鍵盤
document.addEventListener("keyup", keyup, false);//註冊放開鍵盤
document.addEventListener("touchstart", touchstart, false);
document.addEventListener("touchend", touchend, false);
document.addEventListener("touchcancel", touchcancell, false);
document.addEventListener("touchmove", touchmove, false);



function keydown(e) {
    console.log(e.keyCode);
    if (e.keyCode == 38) player.dir[0] = 1;
    if (e.keyCode == 40) player.dir[1] = 1;
    if (e.keyCode == 37) player.dir[2] = 1;
    if (e.keyCode == 39) player.dir[3] = 1;
    if (e.keyCode == 32) player.shoot = 1;
}
function keyup(e) {
    if (e.keyCode == 38) player.dir[0] = 0;
    if (e.keyCode == 40) player.dir[1] = 0;
    if (e.keyCode == 37) player.dir[2] = 0;
    if (e.keyCode == 39) player.dir[3] = 0;
    if (e.keyCode == 32) player.shoot = 0;
}

function touchstart(e){
    e.preventDefault();
    if (e.targetTouches.length == 1) player.shoot = 1;
}

function touchend(e){
    e.preventDefault();
    player.shoot = 0;
}

function Player(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = 25;
    this.sp = 7;

    this.lastshoot = 0;
    this.delay = 200;

    this.dir = [0, 0, 0, 0];//上下左右
    this.shoot = 0;

    this.score = 0;

    this.hp = 3;

    this.covering = false;
    this.covrtTimer = 0;
    this.coverDelay = 2000;

    this.color = "#FF0"

    this.update = function () {
        if (this.dir[0] == 1) this.y -= this.sp;
        if (this.dir[1] == 1) this.y += this.sp;
        if (this.dir[2] == 1) this.x -= this.sp;
        if (this.dir[3] == 1) this.x += this.sp;

        if (this.x < this.r) this.x = this.r;
        if (this.y < this.r) this.y = this.r;
        if (this.x > width - this.r) this.x = width - this.r;
        if (this.y > height - this.r) this.y = height - this.r;

        if (this.shoot == 1 && (new Date().getTime() - this.lastshoot) > this.delay) {
            bullet.push(new Bullet(this.x, this.y, 270));
            this.lastshoot = new Date().getTime();
        }
        if (this.covering && (getNow() - this.coverTimer) > this.coverDelay) {
            this.covrtTimer = 0;
            this.covering = false;
            this.color = "#FF0";
        }
    }
    this.render = function () {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
    this.hit = function (dmg) {
        if (this.covering) return;
        this.hp = Math.max(this.hp - dmg, 0);
        console.log(player.hp)
        this.covering = true;
        this.coverTimer = getNow();
        this.color = "#F77";
    }
}


function Bullet(x, y, angle) {
    this.x = x;
    this.y = y;
    this.r = 10;
    this.sp = 10;
    this.vx = Math.cos(angle * Math.PI / 180) * this.sp;
    this.vy = Math.sin(angle * Math.PI / 180) * this.sp;


    this.update = function () {
        this.x += this.vx;
        this.y += this.vy;
    }
    this.render = function () {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
    }
}
function getDist(obj1, obj2) {
    var dx = obj2.x - obj1.x;
    var dy = obj2.y - obj1.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    return d <= obj2.r + obj1.r;
}

function getNow() {
    return new Date().getTime();
}
function Enemy() {
    this.r = 20;
    this.x = random(30, width - 30);
    this.y = - this.r;

    this.hp = 1;
    this.dead = 0;

    this.sp = wavenum + 1;
    this.rad = random(20, 160) * Math.PI / 180;
    this.vx = Math.cos(this.rad) * this.sp;
    this.vy = Math.sin(this.rad) * this.sp;
    this.color = "rgb(" + random(100, 255) + "," + random(100, 255) + "," + random(100, 255) + ")";

    this.update = function () {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < this.r && this.vx < 0) this.vx = -this.vx;
        if (this.y < this.r && this.vy < 0) this.vy = -this.vy;
        if (this.x > width - this.r && this.vx > 0) this.vx = -this.vx;
        if (this.y > height - this.r && this.vy > 0) this.vy = -this.vy;
    }
    this.render = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    this.hit = function (dmg) {
        this.hp = Math.max(this.hp - dmg, 0);
        if (this.hp <= 0)
            this.dead = 1;
    }
}