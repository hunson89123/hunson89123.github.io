//載入fb文件
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js'
import { getDatabase, onValue, ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js"

//fbConfig
const firebaseConfig = {
  apiKey: "AIzaSyAIJw-zxh6SvNFodKkZrDVbKL0PTEYX9rg",
  authDomain: "webcardgame-c43d7.firebaseapp.com",
  databaseURL: "https://webcardgame-c43d7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webcardgame-c43d7",
  storageBucket: "webcardgame-c43d7.appspot.com",
  messagingSenderId: "984664999700",
  appId: "1:984664999700:web:e6ec3b18f3432d9ed8a401",
  measurementId: "G-K5W43CYZKK"
};

//初始化遊戲資料變數
let numOfUser,numOfRoom;
let userID = 0;

//初始化fb
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(getDatabase());
//增
function writeUserData(userId, name, email, imageUrl) {
  const db = getDatabase();
  set(ref(db, 'users/' + userId), {
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}

//查(users/0)
function readdata(){
  get(child(dbRef, 'users/0')).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val().email);
      document.getElementById('read').innerHTML=snapshot.val().email;
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}

//查詢遊戲資訊(玩家人數|遊戲房間)
function readGameData(){
  onValue(ref(db, 'gameData'),(snapshot) => {
    numOfUser=snapshot.val().userData.num;
    numOfRoom=snapshot.val().roomData.num
    
    document.getElementById('gameData').innerHTML="線上玩家："+numOfUser+" | 遊戲房間："+numOfRoom;
  })
}

function loginCheck(){
  get(child(dbRef, 'gameData/userData/num')).then((snapshot) => {
    userID = snapshot.val()+1;
    console.log(userID);
    set(ref(db, 'gameData/userData'), {
      num: userID
    });
  });
  
}
// writeUserData("0","hunson","hunson89123@gmail.com","https://lh3.googleusercontent.com/ogw/AOh-ky2GM3d-efYoL1aCQkD_urwJqsenth6BMHnibpViUQ=s32-c-mo")
readGameData();
loginCheck();