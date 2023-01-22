const showSelect = document.getElementById('select');
const showResult = document.getElementById('result');
var point = 0;
var totle = 0;
function selected(btn) {
    if (btn.id == 'A') point = 20;
    else if (btn.id == 'J' || btn.id == 'Q' || btn.id == 'K') point = 10;
    else point = parseInt(btn.id);
    showSelect.innerHTML = "<span class='text-danger'>" + btn.id + "</span> 加" + point + "分";
}
function plus() {
    totle += point;
    point = 0;
    update();
}

function clr() {
    point = 0;
    totle = 0;
    update();
}

function update() {
    showResult.innerHTML = "<b style='font-size: 100px'>" + totle + "</b>";
    showSelect.innerHTML = "-";
}