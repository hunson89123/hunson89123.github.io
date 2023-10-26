const bg_img = document.querySelector(".bg-img");
const title_food = document.querySelector(".title-food");
const food_list = ["壽司", "鍋貼", "漢堡", "披薩", "炒飯", "快炒", "素食", "速食", "火鍋", "牛排", "烤肉", "刈包", "肉粽", "肉圓", "碗粿", "滷味", "便當"];
bg_img.src = "https://source.unsplash.com/random/1920x1080/?food";
randomFoodTxt();
title_food.onanimationiteration = () => animIter();
function animIter() {
    randomFoodTxt();
}

function randomFoodTxt() {
    title_food.innerText = food_list[Math.floor(Math.random() * food_list.length)];
}