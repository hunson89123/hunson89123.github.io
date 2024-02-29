const menu = document.getElementById('menu');
const start = document.getElementById('start');
const confirm_spotlight = document.getElementById('confirm');
var click_count = 0;
start.style.display = 'none';
confirm_spotlight.style.display = 'none';
document.getElementById('menu_input').addEventListener('change', function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
        var imageUrl = event.target.result;
        var img = document.createElement('img');
        img.id = 'menu_img';
        img.src = imageUrl;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';

        menu.innerText = '';
        menu.appendChild(img);
        menu.style.boxShadow = '0px 0px 50px 15px #f3621e'
        start.style.display = 'block';
    };

    reader.readAsDataURL(file);
});

document.getElementById('start').addEventListener('click', function () {
    var image = document.getElementById('menu_img');
    var offsetPadding = 10;
    var targetX = Math.floor(Math.random() * (image.offsetWidth - offsetPadding));
    var targetY = Math.floor(Math.random() * (image.offsetHeight - offsetPadding));
    var scale = 3;

    image.style.transform = `translate(-50%, -50%) translate(${targetX}px, ${targetY}px) scale(3)`;

    confirm_spotlight.style.display = 'block';
    menu.style.boxShadow = `0px 0px ${55 + click_count}px ${15 + click_count}px #f3621e`
    click_count++;
});