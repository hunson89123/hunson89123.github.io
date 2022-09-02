//載入fb文件
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js'
import { getDatabase, onValue, onDisconnect, query, orderByChild, update, ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js"
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";

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

//初始化遊戲元素
const gameStateBar = document.getElementById('gameState');
const handArea = document.getElementById('handArea');
const gameData = document.getElementById('gameData');
const queueArea = document.getElementById('queueArea');

//初始化遊戲資料變數
let numOfUser = 0,numOfRoom = 0;
let userID = 0,userName = '';
let allReady = false;
let cards = [];
let queuePlayers =[];
let handCards = [];

//初始化fb
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(getDatabase());

//初始化遊戲元素陣列
function initGameEle(){
  queuePlayers= 
  [ document.getElementById('queuePlayer1'),
  document.getElementById('queuePlayer2'),
  document.getElementById('queuePlayer3'),
  document.getElementById('queuePlayer4') ];

  handCards = [
  document.getElementById('hand1'),
  document.getElementById('hand2'),
  document.getElementById('hand3'),
  document.getElementById('hand4'),
  document.getElementById('hand5'),
  document.getElementById('hand6'),
  document.getElementById('hand7'),
  document.getElementById('hand8'),
  document.getElementById('hand9'),
  document.getElementById('hand10'),
  document.getElementById('hand11'),
  document.getElementById('hand12'),
  document.getElementById('hand13')
  ]
}

//查詢遊戲資訊(玩家人數|遊戲房間)
function readGameData(){
  onValue(ref(db, 'players'),(snapshot) => {
    numOfUser = Object.keys(snapshot.val()).length;
    numOfRoom = parseInt((numOfUser%4)/4)+1;
    //登入中請稍候
    if(numOfUser != 0){
      // console.log("nOU=",numOfUser);
      const loading = document.getElementById('loading');
      if(loading != null){
        loading.style.animation = "fadeOut .8s forwards";
        setTimeout(function() {
          loading.parentNode.removeChild(loading);
        }, 800);
      }
    }
    gameData.innerHTML="線上玩家："+numOfUser+" | 遊戲房間："+numOfRoom;
    set(ref(db,'gameData'),{
      numOfUser: numOfUser,
      numOfRoom: numOfRoom,
    });
  })

}

//登入驗證(給ID)
function loginCheck(){

  //輸入資料進db
  const auth = getAuth();
  onAuthStateChanged(auth,(user) => {
    if (user) {
      const uid = user.uid;
      const urf = ref(db,`players/${uid}`);
      // userName = "玩家"+uid.substring(0,4);
      userID = uid;
      set(urf,{
        id: uid,
        index: "",
        name: userName,
        hand: "",
        room: numOfRoom,
      });
      console.log(uid);

      //斷線清除
      onDisconnect(urf).remove();

      //讀取遊戲資訊
      readGameData();
    }
  });

  signInAnonymously(auth)
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode,errorMessage);
  });


}

// writeUserData("0","hunson","hunson89123@gmail.com","https://lh3.googleusercontent.com/ogw/AOh-ky2GM3d-efYoL1aCQkD_urwJqsenth6BMHnibpViUQ=s32-c-mo")
loginCheck();

//修改名字
export function editUserName(newName){
  if(newName != "" && newName != null){
    const updates = {};
    updates['players/' + userID + '/name'] = newName;
    userName = newName;
    update(ref(db), updates);
    startQueue();
  }
}

//進入列隊畫面
function startQueue(){
  initGameEle();
  //進入列隊畫面淡出效果
  if(userName != ""){
    var play = document.getElementById('play');
    if(play!=null){

      play.parentNode.removeChild(play);
      queueArea.hidden = false; 
      queueArea.style.animation = "flyIn .5s";
      document.body.style.animation = "bg1 1s forwards";
      gameStateBar.style.animation = "fadeIn .8s infinite alternate";
      gameStateBar.innerHTML = "等待玩家中...";
    }

    //指定玩家順序
    get(child(dbRef, 'players')).then((snapshot) => {
      var time = new Date().getTime();
      snapshot.forEach(function(child){
        const updates = {};
        if(child.key == userID){
          updates['players/'+child.key+'/index'] = time;
          updates['players/'+child.key+'/room'] = numOfRoom;
          update(ref(db),updates);
        }
      });
    });

    //取得所有玩家遊戲名稱
    var cdStartGame;
    onValue(ref(db, 'players'),(snapshot) => {
      let index = 0;
      queuePlayers.forEach(i => i.innerHTML = "--");
      const sortedList = query(ref(db, 'players'), orderByChild('index'));
      get(sortedList).then((snapshot) =>{
        snapshot.forEach(function(child){
          let playerName = child.val().name;
          let playerId = child.val().id;
          if(playerName != ""){
            if(playerId == userID)
              queuePlayers[index].innerHTML = "<span style=\"color:yellow;font-weight:bold\" >"+child.val().name+"</span>";
            else
              queuePlayers[index].innerHTML = child.val().name;
            index++;
          }
          console.log(index);
          if(index > 3 ){
            gameStateBar.style.animation="";
            // var cd = 5;
            var cd =1;
            //檢測到計時是否存在
            if(!cdStartGame){
              cdStartGame = setInterval(function() {
                if(cd>0){
                  gameStateBar.innerHTML = "遊戲將於"+cd+"秒後開始!";  
                }else if (cd === 0){
                  clearInterval(cdStartGame);
                  inGame();
                }
                cd--;
              }, 1000);
            }
            console.log(index+":"+allReady);
          }
        });

      })


    });
  }
}

function inGame(){
  console.log('mecll');
  const vw = window.innerWidth ;
  document.body.style.animation = "bg2 .5s forwards";
  handArea.style.display = 'flex';
  const cw = handCards[0].offsetWidth;
  for(let i =0 ;i<13 ;i++){
    handCards[i].style.marginLeft = i * cw/3 +"px";
  }
  handArea.style.width = cw/3*12+cw+"px";
  gameStateBar.style.animation = "fadeOut .5s forwards";
  queueArea.style.animation = "fadeOut .5s forwards";
  gameData.style.animation = "fadeOut .5s forwards";
  handArea.style.animation = "fadeIn .5s forwards";
  handArea.hidden = false;
}

//color code
//Blue   #188CFF
//Red    #FF3B30
//Yellow #EBD300
//Green  #00C700
//Blueen #01E8E7
//Purple #AE6BFF
//Orange #FF8800
//Pink   #F65CB2