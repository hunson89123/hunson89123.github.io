var map = L.map('map').setView([23.97565, 120.9738819], 8)//座標為臺灣地理中心

document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    if (name == 'r') changeImg();
}, false);

//夜晚圖層
var NightLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
}).addTo(map);

//白天圖層
var DayLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
});

var circle = L.circle([23.97565, 120.9738819], {
    color: '#121212',
    fillColor: '#F03',
    fillOpacity: 0.1,
    radius: 500
}).addTo(map);
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
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('網路連線發生錯誤!');
            }
            return response.text();
        })
        .then(xmlText => {
            // 將XML文本轉換為XML DOM
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const rootNode = xmlDoc.documentElement;
            console.log('根節點名稱：', rootNode.tagName);

        })
        .catch(error => {
            console.error('發生錯誤：', error);
        });
}
GetSheetData();