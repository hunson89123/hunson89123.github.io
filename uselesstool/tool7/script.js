var img = document.getElementById('img');
var m = document.getElementById('map');
var r = document.getElementById('R');
var map = L.map('map').setView([24.152356772740916, 120.68245092136593], 7)

document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    if (name == 'r') changeImg();
}, false);

//預設圖層
var DEF = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
//夜曲圖層
var NOC = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

//逆命圖層
var TF = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

function changeImg() {
    DEF.remove();
    img.style.display = "block";
    if (img.src === "https://hunson89123.github.io/uselesstool/tool7/NOC.png") {
        img.src = "https://hunson89123.github.io/uselesstool/tool7/TF.png"
        r.src = "https://hunson89123.github.io/uselesstool/tool7/NOC R.png"
        NOC.remove();
        TF.addTo(map);
        map.setZoom(7);
        m.style.alignItems = 'end';
        map.setView(10);
    } else {
        img.src = "https://hunson89123.github.io/uselesstool/tool7/NOC.png"
        r.src = "https://hunson89123.github.io/uselesstool/tool7/TF R.png"
        TF.remove();
        NOC.addTo(map);
        map.flyTo([24.152356772740916, 120.68245092136593], 19)
        m.style.alignItems = 'start';
    }
}