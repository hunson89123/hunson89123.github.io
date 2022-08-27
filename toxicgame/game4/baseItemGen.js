function itemPicGen(){
  var bia = document.getElementById('bia');
  bia.innerHTML = '';
  for(let i=0;i<9;i++){
    bia.innerHTML += '<img id=\"'+baseItem[i]+'\"src=\"tftItem/'+baseItem[i]+'.png\" onclick=\"onItemClick(this)\"/>';
  }
}

