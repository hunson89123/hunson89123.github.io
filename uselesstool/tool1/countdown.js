var today = new Date();
var nxtYear = today.getFullYear() + 1;
var happyNewYear = new Date("Jan 1, " + nxtYear + " 00:00:00")
document.getElementById('title').textContent = "距離 " + nxtYear + " 年剩下";
var x = setInterval(function () {
  var now = new Date().getTime();
  var cuntTime = happyNewYear - now;
  var days = Math.floor(cuntTime / (1000 * 60 * 60 * 24));
  var hours = Math.floor((cuntTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((cuntTime % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((cuntTime % (1000 * 60)) / 1000);
  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;
}, 0);