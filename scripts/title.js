const title = document.querySelector('.title');
let title_text = document.title;
var count = 0;
var delay = 87;
//判斷標題長度，過長時則換行
if (title_text.length > 16) {
    title_text = title_text.replaceAll(" ", "<br>")
}
const interval = setInterval(function () {
    title.innerHTML = title_text
        .split("")
        .map((e, i) => getRndChar(e, i))
        .join("")
    if (count < delay) count++;
    else count = 0;
}, 50)

function getRndChar(c, i) {
    if (i < count || c == "<" || c == "b" && title_text[i - 1] == '<' || c == "r" && title_text[i + 1] == '>' || c == ">") return title_text[i];
    //非字母
    if (c.charCodeAt(0) < 65) return String.fromCharCode(32 + Math.floor(Math.random() * 16))
    //大寫字母
    else if (c == c.toUpperCase()) return String.fromCharCode(65 + Math.floor(Math.random() * 26))
    //剩下的(小寫字母)
    else return String.fromCharCode(97 + Math.floor(Math.random() * 26))
}