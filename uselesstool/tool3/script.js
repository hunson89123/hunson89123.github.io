const weekBtn = document.getElementsByClassName('page-link');
const weekName = 'W5'
const lastWeek = weekBtn.length - 2;
const reportArea = document.getElementById('reportArea');
let currentWeek = 1;
Array.from(weekBtn).forEach((element, index) => {

    element.addEventListener("click", function () {

        if (index == 0) {
            if (currentWeek > 1) currentWeek--;
        } else if (index == weekBtn.length - 1) {
            if (currentWeek < weekBtn.length) currentWeek++;
        } else {
            currentWeek = index;
        }

        if (currentWeek == 1) weekBtn[0].classList.add("disabled");
        else weekBtn[0].classList.remove("disabled");
        if (currentWeek == lastWeek) weekBtn[lastWeek + 1].classList.add("disabled");
        else weekBtn[lastWeek + 1].classList.remove("disabled");

        btnStatSwitch(currentWeek);
    });

    var reportWeb = new File([], "/reports/" + element.textContent);
    if (reportWeb.size != 0)
        btn.classList.remove("disabled")
});

function btnStatSwitch(currentBtn) {
    const element = weekBtn[currentBtn];
    Array.from(weekBtn).forEach(btn => {
        btn.classList.remove("active")
    });
    if (element.textContent != "上一週" && element.textContent != "下一週") {
        element.classList.add("active")
        reportArea.src = "/reports/" + element.textContent
    }
}

