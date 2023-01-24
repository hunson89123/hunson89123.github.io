const num = document.getElementById('num');
const confirm = document.getElementById('confirm');
const mArr = ['pN', 'pE', 'pS', 'pW'];
const pOffColor = "rgb(63, 46, 4)";
const pOnColor = "rgb(255, 200, 4";
const dOffColor = "rgb(63, 23, 4)";
const dOnColor = "rgb(255, 20, 4)"
var number = 0;
var dealer = 0;
var sPlayer = 0;
var counting = false;
var timer = 0;
function calcu() {
    if (!counting) {
        number = parseInt(num.value);
        num.innerHTML = number;
        timer = 0;
        sPlayer = 0;
        countingTimer();
    }
}

function countingTimer() {
    timer = setTimeout(function () {
        if (sPlayer < number) {
            counting = true;
            sPlayer++;
            num.value = number - sPlayer;
        } else {
            counting = false;
            return;
        }
        var cPlayer = document.getElementById(mArr[3 - sPlayer % 4]);
        lightOn(cPlayer);
        countingTimer();
    }, sPlayer * 25)

}
function sDealer(m) {
    setDealer(m)
    num.innerHTML = dealer;
}


function lightOn(m) {
    clearColor();
    setColor(m, (getColor(m) == pOffColor) ? pOnColor : dOnColor);
}

function lightOff(m) {
    setColor(m, (getColor(m) == pOnColor || getColor(m) == pOffColor) ? pOffColor : dOffColor);
}
function setColor(m, c) {
    var ms = m.style;
    switch (m.id) {
        case mArr[0]:
            ms.borderTop = "8vw solid " + c;
            break;
        case mArr[1]:
            ms.borderRight = "8vw solid " + c;
            break;
        case mArr[2]:
            ms.borderBottom = "8vw solid " + c;
            break;
        case mArr[3]:
            ms.borderLeft = "8vw solid " + c;
            break;
    }
}

function getColor(m) {
    var ms = m.style;
    var color;
    switch (m.id) {
        case mArr[0]:
            color = ms.borderTopColor;
            break;
        case mArr[1]:
            color = ms.borderRightColor;
            break;
        case mArr[2]:
            color = ms.borderBottomColor;
            break;
        case mArr[3]:
            color = ms.borderLeftColor;
            break;
    }
    return color;
}

function setDealer(m) {
    clearColor(m);
    setColor(m, dOnColor);
    switch (m.id) {
        case mArr[0]:
            dealer = 0;
            break;
        case mArr[1]:
            dealer = 1;
            break;
        case mArr[2]:
            dealer = 2;
            break;
        case mArr[3]:
            dealer = 3;
            break;
    }
    // sPlayer = dealer;
}

function clearColor() {
    for (var i = 0; i < 4; i++) {
        var cPlayer = document.getElementById(mArr[i]);
        setColor(cPlayer, pOffColor);
    }
}
