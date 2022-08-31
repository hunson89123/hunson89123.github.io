
//開始遊戲(取名)
let userName = "";
function startGame(){
  userName = prompt('請輸入玩家名稱~','');
  if(userName != "" && userName != null){
    // location.href = "room";
    createRoom();
  }
}

function createRoom(){
  set(ref(db, 'rooms'), {
    players: userName
  });
}

export {createRoom};