let i1_isSet = false,i2_isSet = false;
let i1_num = 1,i2_num = 1,total = 1;
var i1 = document.getElementById('item1');
var i2 = document.getElementById('item2');
var correct = document.getElementById('correct');
var wrong = document.getElementById('wrong')
function initGame(){
  document.getElementById('ans').src=getRndPic();
  itemPicGen();
}

function onItemClick(bi){
  total = 1;
  if(!i1_isSet){
    i1.src = "tftItem/"+ bi.id +".png";
    i1_isSet=true;
    i2_isSet=false;
    i1_num = bi.id;
  }else if(!i2_isSet){
    i2.src = "tftItem/"+ bi.id +".png";
    i2_isSet=true;
    i1_isSet=false;
    i2_num = bi.id;
    document.getElementById('confirm').disabled = false;
  }
  total = i1_num * i2_num;
  console.log('tt='+total+',ans='+ans);
}

function checkAnswer(){
  correct.removeAttribute("style");
  wrong.removeAttribute("style");
  i1_isSet = false;
  i2_isSet = false;
  document.getElementById('confirm').disabled = true;
  console.log('tt='+total+',ans='+ans);
  if(total === ans){
    correct.style.boxShadow = 'inset 0 0 40px 10px green';
    correct.style.animation = 'fade 1s forwards';
    initGame();
  }else{
    wrong.style.boxShadow = 'inset 0 0 40px 10px red';
    wrong.style.animation = 'fade 1s forwards';
  }
  total=1;
  i1.src="tftItem/0.png";
  i2.src="tftItem/0.png";
}
