const num = document.getElementById('num');
const confirm = document.getElementById('confirm');
const result = document.getElementById('result');
const mArr = ['pN', 'pE', 'pS', 'pW'];
const pOffColor = "rgb(63, 46, 4)";
const pOnColor = "rgb(255, 200, 4)";
const dOffColor = "rgb(63, 23, 4)";
const dOnColor = "rgb(255, 20, 4)"
const pShadow = "drop-shadow(0px 0px 100px rgba(255, 200, 4, 1))"
const dShadow = "drop-shadow(0px 0px 100px rgba(255, 20, 4, 1))"
var number = 0;
var dealer = 0;
var sPlayer = 0;
var counting = false;
var timer = 0;
function calcu() {
    number = parseInt(num.value);
    if (!counting && number > 0) {
        num.innerHTML = number;
        timer = 0;
        sPlayer = 0;
        countingTimer();
        confirm.innerHTML = "--";
    }
}

function countingTimer() {
    timer = setTimeout(function () {
        if (sPlayer < number) {
            counting = true;
            var cPlayer = document.getElementById(mArr[3 - ((sPlayer + (3 - dealer)) % 4)]);
            lightOn(cPlayer);
            num.value = number - sPlayer;
            confirm.disabled = true;
            sPlayer++;
        } else {
            counting = false;
            confirm.disabled = false;
            confirm.innerHTML = getResult(number);
            return;
        }
        countingTimer();
    }, sPlayer * 10)

}
function sDealer(m) {
    setDealer(m)
    num.innerHTML = dealer;
}


function lightOn(m) {
    clearColor();
    setColor(m, (getColor(m) == pOffColor || getColor(m) == dOnColor) ? pOnColor : dOnColor);
    m.style.filter = (getColor(m) == pOffColor || getColor(m) == dOnColor) ? dShadow : pShadow;
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
    if (!counting) {
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
        clearColor(m);
        setColor(m, dOnColor);
        m.style.filter = dShadow;
        sPlayer = dealer;
    }
}

function clearColor() {
    for (var i = 0; i < 4; i++) {
        var cPlayer = document.getElementById(mArr[i]);
        if (i != dealer)
            setColor(cPlayer, pOffColor);
        else
            setColor(cPlayer, dOffColor);
        cPlayer.style.filter = "";
    }
}

function getResult(n) {
    var result = "";
    switch (n % 4) {
        case 0:
            result = "下家";
            break;
        case 1:
            result = "自己";
            break;
        case 2:
            result = "上家";
            break;
        case 3:
            result = "對家";
            break;
    }
    return result;
}