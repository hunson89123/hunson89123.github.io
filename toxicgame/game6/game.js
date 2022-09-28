let chessName = ["卒", "象", "士", "砲", "馬", "車", "將", "兵", "相", "仕", "炮", "傌", "俥", "帥"];

function initGame() {
  var chesses = document.getElementsByTagName('span');
  for (var i = 0; i < chesses.length; i++) {
    chesses[i].onclick = onChessClick;
  }
}

function onChessClick() {
  console.log(this.id);
  var chess = document.getElementById(this.id);
  var chessNum = Math.floor(Math.random() * 14);
  chess.innerHTML = chessName[chessNum];
  // this.style.backgroundColor = "#1363DF"
  if (chessNum > 6)
    this.style.color = "#E94560";
  else
    this.style.color = "#FFFFFB"
}