var map = L.map('map').setView([23.97565, 120.9738819], 8)//座標為臺灣地理中心

document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    if (name == 'r') changeImg();
}, false);

//夜晚圖層
var NightLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
}).addTo(map);


//白天圖層
var DayLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
});

function GetSheetData() {
    // Google Sheets 分享連結
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRMEKKrENW31pjUmAMjZYf0K2OuydrPOx5QSKdSaAJva75jlbsZVsCxM0qFVVI9jf1skPoNFvGSxWZ2/pubhtml?gid=2066098648&single=true';

    try {
        fetch(sheetURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('網路連線發生錯誤!');
                }
                return response.text();
            })
            .then(html => {
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
                for (var i = 3; i < tableArray.length; i++) {
                    var url = tableArray[i][12];
                    if (url != '') GetCAPData(url);
                }
            })
            .catch(error => {
                console.error('發生錯誤：', error);
            });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function GetCAPData(url) {
    const severityColor = {};
    severityColor['Unknown'] = '#808080';
    severityColor['Minor'] = '#00ff00';
    severityColor['Moderate'] = '#ffff00';
    severityColor['Severe'] = '#ff8000';
    severityColor['Extreme'] = '#ff0000';
    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'https://corsproxy.io/?' + encodeURIComponent(url), true);// 使用代理伺服器發送請求
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(this.responseText, 'text/xml');
                const alertNode = xmlDoc.getElementsByTagName('alert')[0];
                const infoNode = alertNode.getElementsByTagName('info');
                for (var i = 0; i < infoNode.length; i++) {
                    const areaNode = infoNode[i].getElementsByTagName('area');
                    const severityNode = infoNode[i].getElementsByTagName('severity')[0];
                    for (var j = 0; j < areaNode.length; j++) {
                        const circleNode = areaNode[j].getElementsByTagName('circle');
                        for (var k = 0; k < circleNode.length; k++) {
                            console.log('根節點名稱：', circleNode[k].textContent);
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
                }
            }
            else {
                console.log('取得資料失敗!');
            }
        }
    }
    xhr.send();
    // fetch(url)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('網路連線發生錯誤!');
    //         }
    //         return response.text();
    //     })
    //     .then(xmlText => {
    //         // 將XML文本轉換為XML DOM
    //        

    //     })
    //     .catch(error => {
    //         console.error('發生錯誤：', error);
    //     });
}
GetSheetData();