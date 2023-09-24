var b = document.getElementById("btnUserLoc");
var groupName = document.getElementById("groupName");
var groupAddress = document.getElementById("groupAddress");
var groupPhoneNumber = document.getElementById("groupPhoneNumber");
var markerColor = "#3A8ECE"
var courseInfoCard = document.getElementById('groupInfoCard');
var cICdisplay = window.getComputedStyle(courseInfoCard).getPropertyValue('display');
var markers = {};
var userLatLng = {};
// 圖標資源
var markerIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [30, 50],
        iconAnchor: [15, 50],
        popupAnchor: [1, -50],
        shadowSize: [50, 50]
    }
});

var myLocIcon = new markerIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png' }),
    greenIcon = new markerIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' }),
    redIcon = new markerIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' });
//台北車站位置
var map = L.map('map').setView([25.047755161367576, 121.51700954706328], 18)
map.on('click', onMapClick)
//地圖圖層
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);


if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
} else {
    alert("此瀏覽器不支援地理定位。");
}

function showPosition(position) {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;
    map.setView([userLat, userLng]);
    console.log("userLat")
}

function returnUserLocation() {
    console.log(userLatLng)
    return userLatLng;
}
function onLocationFound(e) {
    userLatLng = e.latlng;
    returnUserLocation();
    markers['myloc'] = L.marker(e.latlng, { icon: myLocIcon }).addTo(map)
        .bindPopup("<span style='font-size: 20px;'>您目前所在位置</span>")
        .openPopup();
    setTimeout((() => map.closePopup()), 1000);
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

function addCourseMarker(gId, gName, gPhoneNumber, gAddress, gLat, gLng) {
    markers[gId] = L.marker([gLat, gLng], { icon: greenIcon }).addTo(map);
    markers[gId].on('click', onMarkerClick.bind(null, gName, gPhoneNumber, gAddress));

}

function onMarkerClick(name, phoneNumber, address, e) {
    clearRedMarker();
    e.target.setIcon(redIcon);
    map.setView(e.target.getLatLng());
    if (cICdisplay = "none") courseInfoCard.style.display = "flex";
    groupName.innerHTML = name;
    groupPhoneNumber.innerHTML = phoneNumber;
    groupAddress.innerHTML = address;

}

function onMapClick(e) {
    if (cICdisplay = "flex") courseInfoCard.style.display = "none";
    clearRedMarker();
}

function clearRedMarker() {
    Object.keys(markers).forEach(element => {
        if (element != 'myloc') markers[element].setIcon(greenIcon);
    });
}
