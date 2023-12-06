document.addEventListener('DOMContentLoaded', function () {
    const gameBoard = document.getElementById('game-board');
    const paddle = document.querySelector('.paddle');
    const ball = document.querySelector('.ball');

    const bricksPerRow = 8;
    const brickRowCount = 5;

    function createBricks() {
        for (let row = 0; row < brickRowCount; row++) {
            for (let col = 0; col < bricksPerRow; col++) {
                const brick = document.createElement('div');
                brick.className = 'brick';
                brick.style.top = `${row * 24}px`;
                brick.style.left = `${col * 44}px`;
                gameBoard.appendChild(brick);
            }
        }
    }

    function movePaddle(event) {
        const boardRect = gameBoard.getBoundingClientRect();
        const paddleRect = paddle.getBoundingClientRect();

        const maxX = boardRect.width - paddleRect.width;
        const mouseX = event.clientX - boardRect.left;
        const paddleX = Math.min(maxX, Math.max(0, mouseX - paddleRect.width / 2));

        paddle.style.left = `${paddleX}px`;
    }

    document.addEventListener('mousemove', movePaddle);

    createBricks();
});
