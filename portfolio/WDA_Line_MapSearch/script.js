const TMSlatlng = [25.047755161367576, 121.51700954706328] //北車經緯度座標
const b = document.querySelector('#btnUserLoc');
const groupName = document.querySelector('#groupName');
const groupAddress = document.querySelector('#groupAddress');
const groupPhoneNumber = document.querySelector('#groupPhoneNumber');
const groupInfoCard = document.querySelector('#groupInfoCard');
const classList = document.querySelector('#classList');
const groupSwitchArea = document.querySelector('#groupSwitch');
const groupListContainer = document.querySelector('#groupListContainer');
const groupList = document.querySelector('#groupList');
const infoCardContent = document.querySelector('.infoCardContent')
var cICdisplay = window.getComputedStyle(groupInfoCard).getPropertyValue('display');
var markers = {}; //圖標物件
var groupClass = {}; //訓練單位班級物件
var groupInfoList = {}; //訓練單位資訊列表物件
var groupCount = {}; //訓練單位個數計算物件(計算同一地點有多少訓練單位)
var currentGroupId = 0;//當前點選之訓練單位ID
var locationStr = "";//座標字串(兩訓練單位經度+緯度相同則視為同一地點)
//圖標資源
var markerIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [30, 50],
        iconAnchor: [15, 50],
        popupAnchor: [1, -50],
        shadowSize: [50, 50]
    }
});
//圖標顏色
var myLocIcon = new markerIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png' }),
    greenIcon = new markerIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' }),
    redIcon = new markerIcon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png' });

var map = L.map('map').setView(TMSlatlng, 17)
//取得使用者位置
map.locate({ setView: true, maxZoom: 17 });
//註冊地圖被點擊事件
map.on('click', onMapClick)
//地圖圖層
const tiles = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

//使用者位置資訊已取得事件
function onLocationFound(e) {
    showNearMarker(e.latitude, e.longitude);
    L.marker(e.latlng, { icon: myLocIcon }).addTo(map)
        .bindPopup("<span style='font-size: 20px;'>您目前所在位置</span>")
        .openPopup();
}

//顯示使用者位置附近之訓練單位地點圖標
function showNearMarker(lat, lng) {
    clearMarker();
    var d = [];
    /*手動固定點*/
    //臺中重疊點
    for (var i = 1; i <= 10; i++) {
        var g = Math.floor(Math.random() * 3) + 1;
        d.push({ GroupId: 'tc0' + g, GroupName: '測試訓練單位tc0' + g, GroupPhoneNumber: '0987654321', GroupAddress: '臺中市某地區' + g + '樓', GroupLat: 24.16052060415238, GroupLng: 120.69431823561976, ClassCode: '152921', ProjectType: 2, ClassName: '測試' + i + '班', TrainStart: '112/11/04', TrainEnd: '113/01/06' })
    }
    //臺中隨機點
    for (var i = 1; i <= 100; i++) {
        var g = Math.floor(Math.random() * 10) + 1;
        d.push({
            GroupId: g,
            GroupName: '測試訓練單位' + g,
            GroupPhoneNumber: '0987654321',
            GroupAddress: '臺中市某地區',
            GroupLat: 24.15 + Math.floor(Math.random() * 50) * 0.001,
            GroupLng: 120.68 + Math.floor(Math.random() * 50) * 0.001,
            ClassCode: '152921',
            ProjectType: 2,
            ClassName: '測試' + i + '班',
            TrainStart: '112/11/04',
            TrainEnd: '113/01/06'
        });
    }
    //桃園重疊點
    for (var i = 1; i <= 10; i++) {
        var g = Math.floor(Math.random() * 5) + 1;
        d.push({ GroupId: 'ty0' + g, GroupName: '測試訓練單位ty0' + g, GroupPhoneNumber: '0987654321', GroupAddress: '桃園市某地區' + g + '樓', GroupLat: 25.0563622, GroupLng: 121.36510163557281, ClassCode: '151191', ProjectType: 2, ClassName: '職場聲音潛能開發及溝通力應用' + i + '班', TrainStart: '112/11/25', TrainEnd: '112/12/23' })
    }
    //桃園"無"隨機點
    /*手動隨機點*/
    Object.values(d).forEach(data => {
        //初始化座標字串
        locationStr = data.GroupLat.toString() + data.GroupLng.toString();
        //取得訓練單位基本資料(根據訓練單位編號)
        if (!groupInfoList[data.GroupId]) {
            var groupInfo = {};
            groupInfo.GroupId = data.GroupId;
            groupInfo.GroupName = data.GroupName;
            groupInfo.GroupPhoneNumber = data.GroupPhoneNumber;
            groupInfo.GroupAddress = data.GroupAddress;
            groupInfo.GroupLat = data.GroupLat;
            groupInfo.GroupLng = data.GroupLng;
            groupInfoList[data.GroupId] = [];
            groupInfoList[data.GroupId].push(groupInfo);
            //取得訓練單位基本資料(根據訓練單位座標)
            if (!groupCount[locationStr]) groupCount[locationStr] = [];
            groupCount[locationStr].push(groupInfo);
        }
        //標示出該地點第一個訓練單位圖標
        if (!markers[data.GroupId] && groupCount[locationStr].length == 1)
            addGroupMarker(data.GroupId, data.GroupName, data.GroupPhoneNumber, data.GroupAddress, data.GroupLat, data.GroupLng);
        //收集訓練單位之課程資訊
        var classInfo = {};
        classInfo.code = data.ClassCode;
        classInfo.projectType = data.ProjectType;
        classInfo.name = data.ClassName;
        classInfo.trainStart = data.TrainStart;
        classInfo.trainEnd = data.TrainEnd;
        if (!groupClass[data.GroupId]) groupClass[data.GroupId] = [];
        groupClass[data.GroupId].push(classInfo);
    }
    )
    //Cluster(群聚)實作
    var groupCluster = L.markerClusterGroup();
    Object.values(markers).forEach(function (item) {
        groupCluster.addLayer(item)
    });
    //排除我的位置
    //groupCluster.removeLayer(markers['myLoc']);
    map.addLayer(groupCluster);
}

//註冊當取得使用者位置資訊事件
map.on('locationfound', onLocationFound);

//顯示選擇訓練單位清單
function showGroupList() {
    createGroupSwitchList();
    groupListContainer.style.display = 'flex';
}

//隱藏選擇訓練單位清單
function hideGroupList() {
    groupListContainer.style.display = 'none';
}

//新增訓練單位圖標並註冊圖標被點擊事件
function addGroupMarker(gId, gName, gPhoneNumber, gAddress, gLat, gLng) {
    markers[gId] = L.marker([gLat, gLng], { icon: greenIcon }).addTo(map);
    markers[gId].on('click', onMarkerClick.bind(null, gId, gName, gPhoneNumber, gAddress, gLat, gLng));
}

//新增班級列表
function addClassTable(groupId) {
    var classHTML = "";
    groupClass[groupId].forEach(function (c) {
        var singupUrl;
        switch (c.projectType) {
            case 1:
                singupUrl = 'https://its.taiwanjobs.gov.tw/Course/Detail?ID=' + c.code;
                break;
            case 2:
                singupUrl = 'https://ojt.wda.gov.tw/ClassSearch/Detail?OCID=' + c.code + '&plantype=1';
                break;
            case 3:
                singupUrl = 'https://ttms.etraining.gov.tw/eYVTR/SearchYoung/Detail?BCM_SNO=' + c.code;
                break;
        }
        classHTML += '<div class="classInfoItem"><div class="classInfo"><div class="name">' + c.name + '</div>'
            + '<div class="info"> 開課期間：' + dateFormater(c.trainStart) + '~' + dateFormater(c.trainEnd)
            + '</div></div><button class="signupBtn"'
            + "onclick = 'window.open(\"" + singupUrl + "\");'> 我要<br>報名</button></div> ";
    });
    return classHTML;
}

//圖標被點擊事件
function onMarkerClick(id, name, phoneNumber, address, lat, lng, e) {
    clearRedMarker();
    e.target.setIcon(redIcon);
    map.setView(e.target.getLatLng());
    if (cICdisplay = "none") groupInfoCard.style.display = "flex";
    showGroupInfo(id, name, phoneNumber, address);
    //判斷該地點是否>1訓練單位
    locationStr = lat.toString() + lng.toString();
    if (groupCount[locationStr].length > 1) groupSwitchArea.style.display = 'flex';
    else groupSwitchArea.style.display = 'none';
    createGroupSwitchList();
}

//當訓練單位清單被點擊
function onGroupListClick(GL) {
    showGroupInfo(GL.id, groupInfoList[GL.id][0].GroupName, groupInfoList[GL.id][0].GroupPhoneNumber, groupInfoList[GL.id][0].GroupAddress);
}

//當地圖被點擊(取消顯示資訊)
function onMapClick(e) {
    if (cICdisplay = "flex") groupInfoCard.style.display = "none";
    clearRedMarker();
}

//顯示訓練單位資訊
function showGroupInfo(i, n, p, a) {
    infoCardContent.scrollTop = 0;
    groupName.innerHTML = n;
    groupPhoneNumber.innerHTML = p;
    groupAddress.innerHTML = a;
    classList.innerHTML = addClassTable(i);
    currentGroupId = i;
}

//建立切換訓練單位選擇清單
function createGroupSwitchList() {
    groupList.innerHTML = "";
    for (var x = 0; x < groupCount[locationStr].length; x++) {
        const para = document.createElement("div");
        const node = document.createTextNode(groupCount[locationStr][x].GroupName);
        para.id = groupCount[locationStr][x].GroupId;
        para.addEventListener('click', function handleClick(event) {
            onGroupListClick(this);
        });
        if (currentGroupId == para.id) para.classList.add("selected");
        para.classList.add("groupListItem");
        para.appendChild(node);
        groupList.appendChild(para);
    }
}


//清除所有紅色圖標(已點擊的)
function clearRedMarker() {
    Object.keys(markers).forEach(element => {
        if (element != 'myloc') {
            markers[element].setIcon(greenIcon);
        }
    });
}

//清除所有圖標
function clearMarker() {
    Object.keys(markers).forEach(element => {
        if (element != 'myloc') map.removeLayer(markers[element]);
    });
}

//日期格式轉換
function dateFormater(date) {
    return date;
    // const day_list = ['日', '一', '二', '三', '四', '五', '六'];
    // var timestamp = parseInt(date.match(/\d+/)[0]);
    // var date = new Date(timestamp);
    // var year = date.getFullYear();
    // var month = String(date.getMonth() + 1).padStart(2, '0');
    // var day = String(date.getDate()).padStart(2, '0');
    // return year + '/' + month + '/' + day + '(' + day_list[date.getDay()] + ')';
}
