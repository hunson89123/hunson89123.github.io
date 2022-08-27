let baseItem = [2,3,5,7,11,13,17,19,23];
let ans;
function getRndPic(){
  ans = getRndNum() * getRndNum();
  return 'tftItem/'+ans+'.png';
}

function getRndNum(){
  return baseItem[Math.floor(Math.random() * 9)];
}