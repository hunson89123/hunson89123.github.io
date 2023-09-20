var x = document.getElementById("userLoc");
var b = document.getElementById("btnUserLoc");
var markerColor = "#3A8ECE"
var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
//台北車站位置
var map = L.map('map').setView([25.047755161367576, 121.51700954706328], 17)
//地圖圖層
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

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
    const zom = 17;
    map.setView([lat, lng], zom);
}

function onLocationFound(e) {
    var radius = e.accuracy;
    L.marker(e.latlng).addTo(map)
        .bindPopup("<span style='font-size: 20px;'>您目前所在位置範圍</span>")
        .on('click', onMarkerClick)
        .openPopup();
    L.circle(e.latlng, radius).addTo(map);
    addCourseMarker();
}

map.on('locationfound', onLocationFound);

function addCourseMarker(lat, lng) {
    var marker = L.marker([24.160191851469346, 120.69425671371461], { icon: greenIcon }).addTo(map);
    marker.bindPopup("<span style='font-size: 20px;'>訓練單位資訊</span>").on('click', onMarkerClick);
}

function onMarkerClick(e) {
    map.setView(e.target.getLatLng(), 20);
}