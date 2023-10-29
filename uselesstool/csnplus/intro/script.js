const bg_img = document.querySelector(".bg-img");
const eatext = document.querySelector("#eatext");
const title_wrap = document.querySelector(".title-wrap");
const title_food_wrap = document.querySelector(".title-food-wrap");
const title_food_1 = document.querySelector(".title-food-1");
const title_food_2 = document.querySelector(".title-food-2");
const title_plus = document.querySelector(".title-plus");
const title_plus_text = document.querySelector(".title-plus span");
const btn_wrap = document.querySelector(".btn-wrap");
const btn_start = document.querySelector(".btn-start");
const food_list = ["壽司", "鍋貼", "漢堡", "披薩", "炒飯", "快炒", "素食", "速食", "火鍋", "牛排", "烤肉", "刈包", "滷味", "便當", "拉麵"];
const show_length = 5;
const light_rnd_color = "rgb(" + (Math.floor(Math.random() * 55) + 200) + "," + (Math.floor(Math.random() * 55) + 200) + ",0)";
const dark_rnd_color = "rgb(" + (Math.floor(Math.random() * 125)) + "," + (Math.floor(Math.random() * 125)) + ",0)";
var food_iter = 0;
bg_img.src = "https://source.unsplash.com/random/1920x1080/?food";
bg_img.onload = function () {
    eatext.style.display = "flex";
    title_food_wrap.style.display = "flex";
}
eatext.style.color = light_rnd_color;
btn_start.style.color = dark_rnd_color;
shuffle(food_list);
for (var x = 0; x < show_length + 1; x++) {
    var c = document.createElement("span");

    if (x == 0) c.innerHTML = "　";
    else if (x == show_length) c.innerHTML = "啥呢";
    else c.innerHTML = food_list[x];
    c.classList.add("title");
    title_food_wrap.appendChild(c);
}
title_food_wrap.onanimationend = () => animEnd(1);
title_plus.onanimationend = () => animEnd(2)

function animEnd(s) {
    switch (s) {
        case 1:
            title_wrap.style.animation = "textAnimLeft .5s ease-in-out forwards";
            title_plus.style.display = "flex";
            break;
        case 2:
            btn_wrap.style.display = "flex";
            break;
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
