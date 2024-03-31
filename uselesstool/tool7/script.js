var map = L.map('map').setView([23.97401041221854, 120.98201232801719], 8)//座標為臺灣地理中心

var div = L.DomUtil.get('bTb'); // this must be an ID, not class!
L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);

// 預設嚴重性顏色
const severityColor = {};
severityColor['Unknown'] = '#808080';
severityColor['Minor'] = '#00ff00';
severityColor['Moderate'] = '#ffff00';
severityColor['Severe'] = '#ff8000';
severityColor['Extreme'] = '#ff0000';

document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    if (name == 'r') changeImg();
}, false);

var baselayers = {
    'CartoDB_Voyager': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'),
    'CartoDB.Positron': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'),
    'CartoDB.DarkMatter': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'),
    'CartoDB.VoyagerLabelsUnder': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png'),
    'OpenStreetMap.HOT': L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png')
};
var overlays = {};
L.control.layers(baselayers, overlays).addTo(map);
baselayers['CartoDB_Voyager'].addTo(map);

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
            tableArray.push(rowArray);
        });
        // 輸出2D陣列
        for (var h = 3; h < tableArray.length; h++) {
            var url = tableArray[h][12];
            if (url != '') {
                var CAPData = await GetCAPData(url);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(CAPData, 'text/xml');
                const alertNode = xmlDoc.getElementsByTagName('alert')[0];
                if (alertNode) {
                    const infoNode = alertNode.getElementsByTagName('info');
                    for (var i = 0; i < infoNode.length; i++) {
                        const areaNode = infoNode[i].getElementsByTagName('area');
                        const severityNode = infoNode[i].getElementsByTagName('severity')[0];
                        for (var j = 0; j < areaNode.length; j++) {
                            const circleNode = areaNode[j].getElementsByTagName('circle');
                            // const polygonNode = areaNode[j].getElementsByTagName('polygon');
                            if (circleNode.length > 0) {
                                for (var k = 0; k < circleNode.length; k++) {
                                    const circleData = circleNode[k].textContent.split(' ');
                                    const location = circleData[0].split(',');
                                    const radius = circleData[1] * 1000;
                                    var circle = L.circle([location[0], location[1]], {
                                        color: severityColor[severityNode.textContent],
                                        fillColor: severityColor[severityNode.textContent],
                                        fillOpacity: 0.1,
                                        radius: radius
                                    }).addTo(map);
                                }
                            }
                            // else if (polygonNode.length > 0) {
                            //     for (var k = 0; k < polygonNode.length; k++) {
                            //         console.log('polygon：', circleNode[k].textContent);
                            //         const circleData = circleNode[k].textContent.split(' ');
                            //         const location = circleData[0].split(',');
                            //         const radius = circleData[1] * 1000;
                            //         var circle = L.circle([location[0], location[1]], {
                            //             color: severityColor[severityNode.textContent],
                            //             fillColor: severityColor[severityNode.textContent],
                            //             fillOpacity: 0.1,
                            //             radius: radius
                            //         }).addTo(map);
                            //     }
                            // }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('發生錯誤:', error);
    }
}

function GetCAPData(url) {
    return new Promise((resolve, reject) => {
        window.setTimeout(function () {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://corsproxy.io/?' + encodeURIComponent(url), true);// 使用代理伺服器發送請求
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    console.log('成功!URL為: ' + url);
                    resolve(xhr.response);
                } else {
                    console.log('失敗!URL為: ' + url);
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            }
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });

            };
            xhr.send();
        }, 100);
    });
}
GetSheetData();

function BackToTW() {
    map.flyTo([23.97401041221854, 120.98201232801719], 8, {
        animate: true,
        duration: 1 // in seconds
    });
}