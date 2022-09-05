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
const vw = window.innerWidth ;
const vh = window.innerHeight ;
const gameStateBar = document.getElementById('gameState');
const handArea = document.getElementById('handArea');
const gameData = document.getElementById('gameData');
const queueArea = document.getElementById('queueArea');
const handState = document.getElementById('handState');
const playerDataArea = document.getElementById('playerDataArea');
let queuePlayers =[];
let handCards = [];
let playerData = [];

//初始化遊戲資料變數
let numOfUser = 0,numOfRoom = 0;
let userID = 0,userName = '',userRoom = 0,userIndex = 0;
let allReady = false;
let cards = [];
let cardsTmp = [];
let userCards = [];
let handCardsSelectedArr = new Array(13).fill(false);
let host = false;
let haveC3 = false;

//初始化fb
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(getDatabase());

//初始化動畫
const infFade = "fadeIn .8s infinite alternate";


//初始化遊戲元素陣列
function initGameEle(){
  queuePlayers= [ 
  document.getElementById('queuePlayer1'),
  document.getElementById('queuePlayer2'),
  document.getElementById('queuePlayer3'),
  document.getElementById('queuePlayer4') 
  ];

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
  ];

  playerData = [
  document.getElementById('playerData1'),
  document.getElementById('playerData2'),
  document.getElementById('playerData3'),
  document.getElementById('playerData4')
  ];
  //產生52張牌
  const suits = ['c' , 'd' , 'h' , 's'];
  const number = [3,4,5,6,7,8,9,10,11,12,13,1,2];
  for(let i=0 ; i<52 ; i++){
    cards[i] = suits[i%4] + number[parseInt(i/4)];
    cardsTmp[i] = i;
  }
}

//查詢遊戲資訊(玩家人數|遊戲房間)
function readGameData(){
  onValue(ref(db, 'players'),(snapshot) => {
    numOfUser = Object.keys(snapshot.val()).length;
    numOfRoom = Math.ceil(numOfUser/4);
    //登入中請稍候
    if(numOfUser != 0){
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

    //指定玩家房間編號
    const updates ={};
    if(userRoom == 0){
      updates['players/'+userID+'/room'] = numOfRoom;
      userRoom = numOfRoom;
      update(ref(db),updates);
    }
  })


  //偵測鍵盤是否按下Enter
  window.addEventListener('keydown',function(e){
    if(e.key == "Enter")
      if(numOfUser != 0)
        editUserName();
    },false);
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
        index: "",
        name: userName,
        hand: "",
        room: userRoom,
        host: false,
      });
      //斷線清除
      onDisconnect(urf).remove();

      //讀取遊戲資訊
      readGameData();
    }
  });


  

  //匿名登入
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
export function editUserName(){
  let newName = prompt("請輸入玩家名稱","");
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
      gameStateBar.style.animation = infFade;
      gameStateBar.innerHTML = "等待玩家中...";
    }

    //給定玩家登入時/房間
    get(child(dbRef, 'players')).then((snapshot) => {
      var time = new Date().getTime();
      snapshot.forEach(function(child){
        const updates = {};
        if(child.key == userID){
          updates['players/'+child.key+'/index'] = time;
          // updates['players/'+child.key+'/room'] = numOfRoom;
          update(ref(db),updates);

          //給定玩家房間編號
          // userRoom = numOfRoom;
        }
      });
    });

    //取得所有玩家遊戲名稱
    var cdStartGame;
    onValue(ref(db, 'players'),(snapshot) => {
      let index = 0;
      //初始化列隊列表(全--)
      queuePlayers.forEach(i => i.innerHTML = "--");

      //依據進入列隊時間排序
      const sortedList = query(ref(db, 'players'), orderByChild('index'));
      get(sortedList).then((snapshot) =>{
        snapshot.forEach(function(child){
          let playerName = child.val().name;
          let playerId = child.key;
          let playerRoom = child.val().room;
          const updates = {};

          if(playerName != "" && playerRoom == userRoom){

            //指派第一位為室長
            if(index == 0) updates['players/'+child.key+'/host'] = true;
            else updates['players/'+child.key+'/host'] = false;
            update(ref(db),updates);
            // console.log(playerId,":",userID);
            
            if(playerId == userID){
              queuePlayers[index].innerHTML = "<span style=\"color:yellow;font-weight:bold\" >"+child.val().name+"</span>";
              //指派玩家順序
              userIndex = index;
            }
            else
              queuePlayers[index].innerHTML = playerName;
            //產生玩家資料卡
            for(let i=0 ; i<userIndex+1 ; i++){
              console.log(index%4);
              playerData[index%4].innerHTML = playerName;
            }
            index++;
          }

          if(index > 3 ){
            gameStateBar.style.animation="";
            // var cd = 5;
            var cd =1;
            //檢測到計時是否存在
            if(!cdStartGame){
              cdStartGame = setInterval(function() {
                if(cd>0){
                  gameStateBar.innerHTML = "遊戲將於"+cd+"秒後開始!";  
                }else if (cd == 0){
                  clearInterval(cdStartGame);
                  inGame();
                }
                cd--;
              }, 1000);
            }
          }
        });
      })
    });
  }
}

//進入遊戲
function inGame(){
  //洗發理牌
  cardShufDealSort();

  //給定卡牌選卡動畫及事件
  cardSelected();

  //進入牌局動畫
  document.body.style.animation = "bg2 .5s forwards";
  handArea.style.display = 'flex';
  playerDataArea.style.display = 'flex';
  gameStateBar.innerHTML = "您的順序是第"+userIndex+"位";
  gameStateBar.style.animation = infFade;
  queueArea.style.animation = "fadeOut .5s forwards";
  queueArea.parentNode.removeChild(queueArea);
  gameData.style.animation = "fadeOut .5s forwards";
  gameData.parentNode.removeChild(gameData);
  handArea.style.animation = "fadeIn 2s forwards";
  playerDataArea.style.animation = "fadeIn 2s forwards";

  //指定卡牌位置及間距
  let coverW = (vw > 600)?1:2;
  const cw = handCards[0].offsetWidth;
  //上排卡
  for(let i =0 ;i<7 ;i++){
    handCards[i].style.bottom = 15 + "vh";
    if(i > 0) {
      handCards[i].style.left =  (handCards[i-1].getBoundingClientRect().left + cw/coverW) +"px";
    }
    else handCards[i].style.left = (vw - (cw/coverW*6+cw))/2 +"px";
  }

  //下排卡
  for(let i =7 ;i < 13; i++){
    if(i > 7) {
      handCards[i].style.left =  (handCards[i-1].getBoundingClientRect().left + cw/coverW) +"px";
    }
    else handCards[i].style.left = (vw - (cw/coverW*5+cw))/2 +"px";
  }
}

//進入遊戲房間
function moveToRoom(){
  //將玩家資料複製至房間
  get(child(dbRef, 'players')).then((snapshot) => {
    snapshot.forEach(function(child){
      // if(child.val().room){

      // }
    });
  });
}

//卡牌洗發
function cardShufDealSort(){
  //判斷是否為室長並洗牌將牌輸入進Fb
  get(child(dbRef, 'players')).then((snapshot) => {
    snapshot.forEach(function(child){
      if(child.key == userID){
        host = child.val().host;
      }

      if(host){
        cardsTmp = shuffle(cardsTmp);
        set(ref(db,'rooms/'+userRoom),{
          cards: cardsTmp,
        });
      }
    });
  });

  //從Fb取得牌
  get(child(dbRef, 'rooms')).then((snapshot) => {
    snapshot.forEach(function(child){
      console.log(child.key +":"+ userRoom);
      if(child.key == userRoom)
        cardsTmp = child.val().cards;

      //發牌、理牌
      userCards = cardsTmp.slice((userIndex)*13,(userIndex)*13+13);
      userCards.sort(function(a,b){return a-b});

      const updates = {};
      updates['players/'+userID+'/hand'] = userCards;
      updates['players/'+userID+'/index'] = userIndex;
      update(ref(db),updates);

      for(let i=0 ; i<13 ; i++){
        if(userCards[i] == 0)haveC3 = true;

        handCards[i].src = "./cards/"+cards[userCards[i]]+".png";
      }
    });
  });

  
}

//卡片選取
function cardSelected(){
  var bodyRect = document.body.getBoundingClientRect();
  const handCardsImg = document.getElementsByTagName("img");
  const cardSelected = e =>{
    var cardRect = e.target.getBoundingClientRect();
    var handAreaRect = handArea.getBoundingClientRect();
    var offset = handAreaRect.bottom - cardRect.bottom;
    var cardSelectStr = "";

    //卡片選取動畫
    for(let i = 0; i<13 ; i++){
      if(e.target.id == handCards[i].id){
        e.target.style.outlineOffset = "-3px";
        if(handCardsSelectedArr[i]){
          e.target.style.bottom = offset - 20 + "px";
          e.target.style.filter = "";
        }else{
          e.target.style.bottom = offset +  20 + "px";
          e.target.style.filter = "drop-shadow(0 10px 0  rgba(0, 0, 0, 0.7))";
        }
        handCardsSelectedArr[i] = !handCardsSelectedArr[i];
      }
    }

    //卡片選取字串
    for(let i=0 ; i<13 ; i++){
      if(handCardsSelectedArr[i])
        cardSelectStr += cards[userCards[i]] + " ";
    }
    handCardState(cardSelectStr);
  }

  //加入卡牌點擊事件
  for(let hCI of handCardsImg){
    hCI.addEventListener("click", cardSelected);
  }
}


//卡牌圖片=>出牌提示
function handCardState(cardSelectStr){
  cardSelectStr=cardSelectStr.replace(/c/g,'♣');
  cardSelectStr=cardSelectStr.replace(/d/g,'♦');
  cardSelectStr=cardSelectStr.replace(/h/g,'♥');
  cardSelectStr=cardSelectStr.replace(/s/g,'♠');
  cardSelectStr=cardSelectStr.replace(/11/g,'J');
  cardSelectStr=cardSelectStr.replace(/12/g,'Q');
  cardSelectStr=cardSelectStr.replace(/13/g,'K');

  if(cardSelectStr != "")
    handState.innerHTML = "選取卡牌："+cardSelectStr;
  else handState.innerHTML = "請點選卡牌";
}


//YatesShuffle演算法
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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