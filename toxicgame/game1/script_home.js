var canvas = document.getElementById('myCanvas');
main();

function main() {
    //load
	
    loop();

}


function loop() {
	resizeCanvas();
    requestAnimationFrame(loop);//16ms 60FPS
}

function resizeCanvas(){
		var can=document.getElementById('myCanvas');
		/* canvas.setAttribute('width',window.innerWidth);
		canvas.setAttribute('height',window.innerHeight); */
		can.width = window.innerWidth;
		can.height = window.innerHeight; 
}