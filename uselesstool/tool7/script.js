const TW_center_coord = [23.71537674452611, 120.99937407526494];
const TW_center_zoomlv = 8;
const bTb = document.getElementById('bTb');
const loadingContainer = document.getElementById('loadingContainer');
const loadingText = document.getElementById('loadingText');
const alertList = document.getElementById('alertList');
var areaL = [];
var map = L.map('map').setView(TW_center_coord, TW_center_zoomlv)//座標為臺灣地理中心
var process_total = 0;
var process_current = 0;

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
    const urls = ['village_103cap.json', 'town_103cap.json', 'city_112cap.json']; // JSON文件的路徑列表
    const responses = await Promise.all(urls.map(url => fetch(url)));
    const jsons = [];
    let fileSizeTotal = 121746902;
    let fileLoaded = 0;
    for (var i = 0; i < responses.length; i++) {
        const reader = responses[i].body.getReader();
        const contentLength = +responses[i].headers.get('Content-Length');
        let receivedLength = 0;

        let chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log(i);
                break;
            }

            chunks.push(value);
            receivedLength += value.length;
            fileLoaded += value.length;
            updateProgress(fileLoaded / 1048576, fileSizeTotal / 1048576, 1);
        }

        const concatenatedChunks = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
            concatenatedChunks.set(chunk, position);
            position += chunk.length;
        }

        const json = JSON.parse(new TextDecoder('utf-8').decode(concatenatedChunks));
        jsons.push(json);
    }
    return jsons;
}

// 進度條更新回調函數
function updateProgress(r, c, s) {
    // 在這裡更新進度條，例如更新 DOM 中的進度條元素
    if (s == 1) {
        var process = Math.round(r / c * 100.0);
        if (process < 100)
            loadingText.textContent = `讀取地圖資料中...${process}%`;
        else
            loadingText.textContent = `即將完成...`;
        loadingContainer.style.backdropFilter = `blur(${100 - process}px)`;
    }
}

function convertGeoJsonToObj(geoJson) {
    const result = {};
    for (var i = 0; i < geoJson.length; i++) {
        console.log(geoJson[i].features);
        geoJson[i].features.forEach(feature => {
            let villCode = feature.properties.nVill103;
            if (!villCode) villCode = feature.properties.nTown103;
            if (!villCode) villCode = feature.properties.NCITY_103;
            result[villCode] = feature;
        });
    }

    return result;
}

fetchJSON().then(json => {
    geoJson = json
    geoJsonObj = convertGeoJsonToObj(geoJson);
    GetSheetData();
})

function GetCoordinatesByGeoCode(geoCode) {
    var coordinateArray = [];
    for (const key in geoJsonObj) {
        if (key === geoCode) {
            coordinateArray.push(geoJsonObj[key] ?? null);
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

        process_total = tableArray.length;

        for (var i = 1; i < tableArray.length; i++) {
            updateProgress(i, process_total, 3);
            var alertContent = tableArray[i][15];
            var areaData = tableArray[i][16];
            var color = severityColor[tableArray[i][11]]
            var onMap = false;
            var notOnMapArea = [];
            var alertExpiresTime = new Date(tableArray[i][14]);
            const areas = [];
            areaL.push([]);
            if (Date.now() < alertExpiresTime) {
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
                                var alertAreaCircle;
                                if (circle[1] > 0) {
                                    alertAreaCircle = L.circle(circle[0].split(",").map(function (item) {
                                        return parseFloat(item);
                                    }), circle[1] * 1000, { fillColor: color, fillOpacity: 0.5, color: color, weight: 1 }).addTo(map);
                                    alertAreaCircle.bindPopup('<h3>' + areaDesc + '</h3>', { autoPan: false, autoClose: false, closeButton: false });
                                } else {
                                    var icon = L.divIcon({
                                        className: 'x-icon',
                                        html: '×',
                                        iconSize: [20, 20]
                                    });
                                    alertAreaCircle = L.marker(circle[0].split(",").map(parseFloat), { icon: icon }).addTo(map);
                                    alertAreaCircle.bindPopup(`<h3>震央(${areaDesc})</h3`, { autoPan: false, autoClose: false, closeButton: false });
                                }
                                areaL[i - 1].push(alertAreaCircle);
                                onMap = true;
                                break;
                            case 'geocode':
                                var coordinate = GetCoordinatesByGeoCode(data.value);
                                if (coordinate.length > 0) {
                                    var combinedGeoJson = fasterUnion(coordinate);

                                    // 在 Leaflet 中顯示合併後的多邊形
                                    var alertAreaPolygon = L.geoJSON(combinedGeoJson, {
                                        style: function (feature) {
                                            return {
                                                fillColor: color,
                                                fillOpacity: 0.5,
                                                color: color,
                                                weight: 1,
                                            };
                                        }
                                    }).addTo(map);
                                    alertAreaPolygon.bindPopup('<h3>' + areaDesc + '</h3>', { autoPan: false, autoClose: false, closeButton: false });
                                    areaL[i - 1].push(alertAreaPolygon);
                                    onMap = true;
                                }
                                else notOnMapArea.push(areaDesc);
                                break;
                            case 'polygon':
                                var coord = data.value.split(" ").map(function (coord) {
                                    var latLng = coord.split(",");
                                    return [parseFloat(latLng[0]), parseFloat(latLng[1])];
                                });

                                var alertPolygon = L.polygon(coord, { fillColor: color, fillOpacity: 0.5, color: color, opacity: 0 }).addTo(map);
                                alertPolygon.bindPopup('<h3>' + areaDesc + '</h3>', { autoPan: false, autoClose: false, closeButton: false });
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
                var notOnMapString = (notOnMapArea.length > 0) ? `※示警區域<b><u>${notOnMapArea.join('、')}</u></b>因地圖資料問題而無出現警示範圍在地圖上` : "";
                var effectiveDate = new Date(tableArray[i][13]);
                var expiresDate = new Date(tableArray[i][14]);
                AddAlertListItem(`
                <h1>${tableArray[i][9]}<h6>發布於${timeAgo}
                <br>示警有效期間：${DateFormater(effectiveDate)} ~ ${DateFormater(expiresDate)}</h6></h1>
                <span>${alertContent}</span><br><span class="text-warning">${notOnMapString}</span>
                `, i);
                process_current++;
                loadingText.text = `載入示警資料中...(${process_current}/${process_total})`;
            } else {
                areaL[i - 1].push('');
            }
        }
        loadingContainer.classList.add('hidden_anim_fadeOut');
    } catch (error) {
        console.error('發生錯誤:', error);
    }
}

function fasterUnion(allGeometries) {
    const mid = Math.floor(allGeometries.length / 2);
    let group1 = allGeometries.slice(0, mid);
    let group2 = allGeometries.slice(mid);

    while (group1.length > 1) {
        group1 = unionGroup(group1);
    }
    while (group2.length > 1) {
        group2 = unionGroup(group2);
    }

    let result;
    if (group1.length === 1 && group2.length === 1) {
        result = turf.union(group1[0], group2[0]);
    } else if (group1.length === 1) {
        result = group1[0];
    } else {
        result = group2[0];
    }

    return result;
}
//#region 工具function
function unionGroup(group) {
    let newGroup = [];
    for (let i = 0; i < group.length; i += 2) {
        let a = group[i];
        let b = i + 1 < group.length ? group[i + 1] : null;
        if (b) {
            newGroup.push(turf.union(a, b));
        } else {
            newGroup.push(a);
        }
    }
    return newGroup;
}

function DateFormater(date) {
    var weekdayZh = ['日', '一', '二', '三', '四', '五', '六'];
    return `${date.getFullYear()}/${String((new Date().getMonth() + 1)).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}(${weekdayZh[date.getDay()]}) 
    ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function AddAlertListItem(htmlContent, alertId) {
    var li = document.createElement("li");
    li.innerHTML = htmlContent;
    li.id = alertId;
    li.addEventListener("click", function () {
        OnAlertItemClick(this);
    });
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
//#endregion
//#region 按鈕function
function BackToTW() {
    map.flyTo(TW_center_coord, TW_center_zoomlv);
}

function GoToMy() {
    map.locate();
}

function OnAlertItemClick(e) {
    var alertId = e.id;
    var bounds = L.latLngBounds([]);
    areaL[alertId - 1].forEach(function (a) {
        if (!(a instanceof L.Marker)) {
            bounds.extend(a.getBounds());
        }
    });

    map.flyToBounds(bounds).on('zoomend', function () {
        areaL.forEach(function (a) {
            a.forEach(function (b) {
                b.closePopup();
            });
        });
        areaL[alertId - 1].forEach(function (a) {
            a.openPopup();
        });
    });
}
//#endregion