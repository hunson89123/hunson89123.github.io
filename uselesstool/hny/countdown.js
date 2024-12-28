var now = new Date(/*"2024/12/31 23:59:55"*/);
fetchCounter();

var x = setInterval(function () {
  now = new Date(now.getTime() + 1000);
  var nxtYear = now.getFullYear() + 1;
  document.getElementById('title').innerHTML = "距離<span id='titleYear'>" + nxtYear + "</span>年剩下";
  const titleYear = document.getElementById('titleYear');
  var happyNewYear = new Date("Jan 1, " + nxtYear + " 00:00:00")
  var cuntTime = happyNewYear - now;
  document.title = `${now.getFullYear()}→${nxtYear}`;

  var days = Math.floor(cuntTime / (1000 * 60 * 60 * 24));
  var hours = Math.floor((cuntTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((cuntTime % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((cuntTime % (1000 * 60)) / 1000);
  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;

  var baseColor = Math.random() * 360;
  var yearText = titleYear.innerText.split('');
  titleYear.innerHTML = "";
  for (var i = 0; i < yearText.length; i++) {
    titleYear.innerHTML += `<span style="color:${getRandomColorString(baseColor)}">${yearText[i]}</span>`
  }
  titleYear.style.color = getRandomColorString(baseColor);
  if (seconds % 5 === 0) {
    fetchCounter();
  }
}, 1000);


function getRandomColorString(baseColor, variation = 87) {
  const hueVariation = Math.random() * variation - variation / 2;
  const finalHue = (baseColor + hueVariation) % 360;
  return `hsl(${finalHue}, 100%, 75%)`;
}