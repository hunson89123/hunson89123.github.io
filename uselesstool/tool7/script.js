var x = document.getElementById("userLoc");
var b = document.getElementById("btnUserLoc");

//台灣中心點位置
var map = L.map('map').fitWorld();
//地圖圖層
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

map.locate({ setView: true, maxZoom: 20 });

function getUserLoction() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "此瀏覽器不支援地理定位。";
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const zom = 13;
    map.setView([lat, lng], zom);
}

function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("您目前所在位置範圍").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);