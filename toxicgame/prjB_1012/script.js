document.addEventListener('DOMContentLoaded', function () {
    const gameBoard = document.getElementById('game-board');
    const player = createPlayer();

    function createPlayer() {
        const playerElement = document.createElement('div');
        playerElement.className = 'player';
        playerElement.style.left = '50%';
        playerElement.style.bottom = '0';
        gameBoard.appendChild(playerElement);
        return playerElement;
    }

    function createBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        gameBoard.appendChild(bubble);
    }

    function handlePlayerMovement(event) {
        const boardRect = gameBoard.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        const maxX = boardRect.width - playerRect.width;
        const mouseX = event.clientX - boardRect.left;
        const playerX = Math.min(maxX, Math.max(0, mouseX - playerRect.width / 2));

        player.style.left = `${playerX}px`;
    }

    function handleBubbleClick(event) {
        const bubble = event.target;
        gameBoard.removeChild(bubble);
    }

    function createRandomBubbles() {
        const x = Math.random() * (gameBoard.clientWidth - 30);
        const y = Math.random() * (gameBoard.clientHeight - 30);
        createBubble(x, y);
    }

    document.addEventListener('mousemove', handlePlayerMovement);
    document.addEventListener('click', createRandomBubbles);

    setInterval(createRandomBubbles, 1000);
});