const eat_list = ["炒飯", "鍋燒意麵", "牛肉麵", "肉燥飯", "壽司", "定食", "速食", "拉麵", "咖哩飯", "雞肉飯", "涼麵", "水餃", "雞肉飯", "鍋貼", "豬排飯", "牛排", "火鍋"];
const res_wrap = document.querySelector(".res_wrap");
const start_btn = document.querySelector(".start_btn")
const eat_search = document.querySelector(".search_area .eat_search");
const eat_res_search = document.querySelector("#eat_res_search");
const search_a = document.querySelector("#search_a")
var eat_res = "👇";
//按下[開始]
function start() {
    if (res_wrap.classList.contains("stop")) res_wrap.classList.remove("stop");
    start_btn.disabled = true;
    eat_search.style.display = "none";
    res_wrap.ontransitionend = () => finish();
    res_wrap.classList.add("run");
    var shuffle_list = shuffle(eat_list);
    res_wrap.innerHTML = "<p>" + eat_res + "</p>";
    for (var x = 0; x < shuffle_list.length; x++) {
        var c = document.createElement("p");
        c.innerHTML = shuffle_list[x];
        res_wrap.appendChild(c);
    }
    eat_res = shuffle_list.slice(-1);
}

//動畫結束
function finish() {
    if (res_wrap.classList.contains("run")) {
        res_wrap.classList.remove("run");
        res_wrap.classList.add("stop");
        res_wrap.innerHTML = "<p>" + eat_res + "</p>";
        eat_res_search.innerHTML = eat_res;
        search_a.href = "https://www.google.com/maps/search/" + eat_res;
        eat_search.style.display = "flex";
        document.querySelector(".res_wrap p").classList.add("res_text");
        start_btn.disabled = false;
    }
}

//YatesShuffle演算法
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
