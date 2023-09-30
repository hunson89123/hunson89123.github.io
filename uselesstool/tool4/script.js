//載入Firebase文件
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js'
import { getDatabase, onValue, onDisconnect, query, orderByChild, update, ref, child, get, set } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js"
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

//FirebaseConfig
const firebaseConfig = {
    apiKey: "AIzaSyAY2ZRf2PruKc-egnatTcn4PaB_mzHDXMM",
    authDomain: "scoreboard-396303.firebaseapp.com",
    databaseURL: "https://scoreboard-396303-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "scoreboard-396303",
    storageBucket: "scoreboard-396303.appspot.com",
    messagingSenderId: "362286398584",
    appId: "1:362286398584:web:cc6f9ab51f56b41cea818d",
    measurementId: "G-9VVHY8L0NQ"
};

//初始化Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const cRoom = document.getElementById('cRoom');
var roomId = "";

cRoom.addEventListener('click', createRoom);

function genRoomId() {
    var roomId = "";
    for (var x = 0; x < 4; x++) {
        var idStr = Math.floor(Math.random() * 10) + '';
        roomId += idStr;
    }
    return roomId;
}

function createRoom() {
    roomId = genRoomId();
    const rIdRef = ref(db, `rooms/${roomId}`);
    set(rIdRef, {
        plyer: 0
    });

    //斷線清除
    onDisconnect(rIdRef).remove();
}