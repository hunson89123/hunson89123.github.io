const TW_center_coord = [23.71537674452611, 120.99937407526494];
const TW_center_zoomlv = 8;
const bTb = document.getElementById('bTb');
const loadingContainer = document.getElementById('loadingContainer');
const loadingText = document.getElementById('loadingText');
const alertList = document.getElementById('alertList');
var bounds = L.latLngBounds(); //儲存所有範圍標示
var map = L.map('map').setView(TW_center_coord, TW_center_zoomlv)//座標為臺灣地理中心


var div = L.DomUtil.get('bTb');

map.on('locationfound', (e) => {
    map.flyTo(e.latlng, 17);
    L.marker(e.latlng, {
        icon: L.icon({
            iconUrl: 'user.png',
            iconSize: [36, 36]
        })
    }).addTo(map);
});

// 預設嚴重性顏色
const severityColor = {};
severityColor['Unknown'] = '#808080';
severityColor['Minor'] = '#00ff00';
severityColor['Moderate'] = '#ffff00';
severityColor['Severe'] = '#ff8000';
severityColor['Extreme'] = '#ff0000';

// document.addEventListener('keydown', (event) => {
//     var name = event.key;
//     var code = event.code;
//     if (name == 'r') changeImg();
// }, false);

var baselayers = {
    'CartoDB_Voyager': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'),
    'CartoDB.Positron': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'),
    'CartoDB.DarkMatter': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'),
    'CartoDB.VoyagerLabelsUnder': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png'),
    'OpenStreetMap.HOT': L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png')
};
var overlays = {};
L.control.layers(baselayers, overlays).addTo(map);
baselayers['CartoDB.DarkMatter'].addTo(map);

//geoJson
var geoJsonObj = {};

async function fetchJSON() {
    const response = await fetch('VILLAGE_NLSC_1120928.json');
    const json = await response.json();
    return json;
}

function convertGeoJsonToObj(geoJson) {
    const result = {};
    geoJson.features.forEach(feature => {
        const villCode = feature.properties.VILLCODE;
        result[villCode] = feature;
    });
    return result;
}

fetchJSON().then(json => {
    geoJson = json
    geoJsonObj = convertGeoJsonToObj(geoJson);
    GetSheetData();
});

function GetCoordinatesByGeoCode(geoCode) {
    var coordinateArray = [];
    for (const key in geoJsonObj) {
        if (key.startsWith(geoCode)) {
            coordinateArray.push(geoJsonObj[key]?.geometry.coordinates ?? null);
        }
    }
    return coordinateArray;
}

async function GetSheetData() {
    // Google Sheets 分享連結
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRMEKKrENW31pjUmAMjZYf0K2OuydrPOx5QSKdSaAJva75jlbsZVsCxM0qFVVI9jf1skPoNFvGSxWZ2/pubhtml?gid=2066098648&single=true';

    try {
        const response = await fetch(sheetURL);
        if (!response.ok) {
            throw new Error('網路連線發生錯誤!');
        }
        const html = await response.text();
        // 將文本轉換為DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 取得工作表
        const table = doc.querySelector('table');

        // 將表格轉換為2D陣列
        const tableArray = [];
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const rowArray = [];
            const cells = row.querySelectorAll('td, th');

            cells.forEach(cell => {
                rowArray.push(cell.textContent.trim());
            });
            if (rowArray[rowArray.length - 1].length !== 0) //檢查資料最後一欄不為空
                tableArray.push(rowArray);
        });

        tableArray.sort((a, b) => {
            const dateA = new Date(a[2]);
            const dateB = new Date(b[2]);
            return dateB - dateA;
        });

        //儲存所有範圍標示

        var areaL = [];

        for (var i = 1; i < tableArray.length; i++) {
            var alertContent = tableArray[i][15];
            var areaData = tableArray[i][16];
            var color = severityColor[tableArray[i][11]]
            var onMap = false;
            const areas = [];


            const regex = /areaDesc@(.*?)\|(geocode|circle|polygon)@([^|]+)/g;
            let match;
            let currentArea = null;
            while ((match = regex.exec(areaData)) !== null) {
                const areaDesc = match[1];
                const type = match[2];
                const value = match[3];

                if (!currentArea || currentArea.areaDesc !== areaDesc) {
                    currentArea = { areaDesc, data: [] };
                    areas.push(currentArea);
                }

                currentArea.data.push({ type, value });
            }
            for (j = 0; j < areas.length; j++) {
                var areaDesc = areas[j].areaDesc;
                for (var k = 0; k < areas[j].data.length; k++) {
                    var data = areas[j].data[k];
                    switch (data.type) {
                        case 'circle':
                            var circle = data.value.split(' ');
                            var alertAreaCircle = L.circle(circle[0].split(",").map(function (item) {
                                return parseFloat(item);
                            }), circle[1] * 1000, { fillColor: color, fillOpacity: 0.5, color: color, opacity: 0 }).addTo(map);
                            alertAreaCircle.bindPopup('<h2>' + areaDesc + '</h2>' + alertContent);
                            areaL.push(alertAreaCircle);
                            onMap = true;
                            break;
                        case 'geocode':
                            var coordinate = GetCoordinatesByGeoCode(data.value);
                            if (coordinate.length > 0) {
                                for (var x = 0; x < coordinate.length; x++) {
                                    coordinate[x] = coordinate[x].map(function (coord) {
                                        return coord.map(function (c) {
                                            return [c[1], c[0]];
                                        })
                                    });
                                    var alertAreaPolygon = L.polygon(coordinate[x], { fillColor: color, fillOpacity: 0.5, color: color, opacity: 0 }).addTo(map);
                                    alertAreaPolygon.bindPopup('<h2>' + areaDesc + '</h2>' + alertContent);
                                    areaL.push(alertAreaPolygon);
                                }
                                onMap = true;
                            }
                            // else console.log(data.value + '找不到!');
                            break;
                        case 'polygon':
                            var coord = data.value.split(" ").map(function (coord) {
                                var latLng = coord.split(",");
                                return [parseFloat(latLng[0]), parseFloat(latLng[1])];
                            });

                            var alertPolygon = L.polygon(coord, { fillColor: color, fillOpacity: 0.5, color: color, opacity: 0 }).addTo(map);
                            alertPolygon.bindPopup('<h2>' + areaDesc + '</h2>' + alertContent);
                            onMap = true;
                            break;
                        default:
                            console.log(`無法解析${data.type}類型`);
                    }
                }
            }

            //alertList
            var date = new Date(tableArray[i][2]);
            var timeAgo = GetTimeAgo(date);
            var notOnMapString = (onMap) ? "" : "※此示警因地圖資料問題而無出現警示範圍在地圖上";
            var effectiveDate = new Date(tableArray[i][13]);
            var expiresDate = new Date(tableArray[i][14]);
            AddAlertListItem(`
            <h1>${tableArray[i][9]}<h6>發布於${timeAgo}
            <br>示警有效期間：${DateFormater(effectiveDate)} ~ ${DateFormater(expiresDate)}</h6></h1>
            <span>${alertContent}</span><br><span class="text-warning">${notOnMapString}</span>
            `);
        }
        loadingContainer.classList.add('hidden_anim_fadeOut');

        areaL.forEach(function (a) {
            bounds.extend(a.getBounds());
        });
    } catch (error) {
        console.error('發生錯誤:', error);
    }
}

function DateFormater(date) {
    var weekdayZh = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getFullYear()}/${String((new Date().getMonth() + 1)).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}(${weekdayZh[date.getDay()]}) 
    ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function AddAlertListItem(htmlContent) {
    var li = document.createElement("li");
    li.innerHTML = htmlContent;
    alertList.appendChild(li);
}

function GetTimeAgo(timestamp) {
    var now = Date.now();
    var difference = now - timestamp;

    var seconds = Math.floor(difference / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    if (days > 0) {
        return days + "天前";
    } else if (hours > 0) {
        return hours + "小時前";
    } else if (minutes > 0) {
        return minutes + "分鐘前";
    } else {
        return seconds + "秒前";
    }
}

function BackToTW() {
    // map.fitBounds(bounds);
    map.flyTo(TW_center_coord, TW_center_zoomlv);
}

function GoToMy() {
    map.locate();
}