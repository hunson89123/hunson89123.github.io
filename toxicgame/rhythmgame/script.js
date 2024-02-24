document.addEventListener('DOMContentLoaded', function () {
    const beat = document.querySelector('.beat');
    const gameContainer = document.querySelector('.game-container');
    const windowHeight = window.innerHeight;

    let score = 0;

    gameContainer.addEventListener('click', function (event) {
        const topPosition = beat.getBoundingClientRect().top;
        const bottomPosition = beat.getBoundingClientRect().bottom;

        if (event.clientY >= topPosition && event.clientY <= bottomPosition) {
            score++;
            console.log('Score: ', score);
        }
    });

    function generateBeat() {
        const newBeat = document.createElement('div');
        newBeat.classList.add('beat');
        newBeat.style.left = Math.random() * (window.innerWidth - 50) + 'px';
        gameContainer.appendChild(newBeat);

        newBeat.addEventListener('animationend', function () {
            this.remove();
        });
    }

    setInterval(generateBeat, 1000);

    // Add background music
    const audio = new Audio('music.mp3');
    audio.loop = true;
    audio.play();

});
