const TW_center_coord = [23.97401041221854, 120.98201232801719];
const TW_center_zoomlv = 7;
const bTb = document.getElementById('bTb');
var map = L.map('map').setView(TW_center_coord, TW_center_zoomlv)//座標為臺灣地理中心


var div = L.DomUtil.get('bTb'); // this must be an ID, not class!
L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
ShowHideBTB();
map.on('move', (e) => {
    ShowHideBTB();
});


map.locate();
map.on('locationfound', (e) => {
    map.flyTo(e.latlng, 17);
});

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
baselayers['OpenStreetMap.HOT'].addTo(map);

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

        for (var i = 0; i < tableArray.length; i++) {
            console.log(tableArray[i][16])
        }
    } catch (error) {
        console.error('發生錯誤:', error);
    }
}

GetSheetData();

function BackToTW() {
    map.flyTo(TW_center_coord, TW_center_zoomlv);
}

function ShowHideBTB() {
    var center = map.getCenter();
    if (center.lat.toFixed(1) == TW_center_coord[0].toFixed(1) && center.lng.toFixed(1) == TW_center_coord[1].toFixed(1) && map.getZoom() == TW_center_zoomlv) {
        bTb.classList.remove("visible_anim_up");
        bTb.classList.add("hidden_anim_down");
    } else {
        bTb.classList.remove("hidden_anim_down");
        bTb.classList.add("visible_anim_up");
    }
}