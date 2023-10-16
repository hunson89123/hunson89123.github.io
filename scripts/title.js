const title = document.querySelector('.title');
const title_text = "Hunson's Lab"
var count = 0;
var delay = 87;
const interval = setInterval(function () {
    title.innerHTML = title_text
        .split("")
        .map((e, i) => getRndChar(e, i))
        .join("")
    if (count < delay) count++;
    else count = 0;
}, 50)

function getRndChar(c, i) {
    if (i < count) return title_text[i];
    //非字母
    if (c.charCodeAt(0) < 65) return String.fromCharCode(32 + Math.floor(Math.random() * 16))
    //大寫字母
    else if (c == c.toUpperCase()) return String.fromCharCode(65 + Math.floor(Math.random() * 26))
    //剩下的(小寫字母)
    else return String.fromCharCode(97 + Math.floor(Math.random() * 26))
}