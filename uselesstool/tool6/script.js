const sheetId = '1f7uWyeLwEJvDdf0yP8hrHo63Nlx9d2rOfRdHwP6scF4';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = ['2023/03', '2023/04', '2023/05', '2023/06', '2023/07', '2023/08', '2023/09', '2023/10', '2023/11', '2023/12', '2024/01'];
const query = encodeURIComponent('Select *')
const start_y = 2023
const start_m = 3
const today = new Date();
const todayDate = new Date(today.toDateString())
const nextDay = new Date().setDate(today.getDate() + 1);
var current_month_index = today.getFullYear() - start_y + today.getMonth() - start_m + 1
var month_index = today.getFullYear() - start_y + today.getMonth() - start_m + 1
var url = `${base}&sheet=${sheetName[month_index]}&tq=${query}`
var isInit = false;
let data = []
document.addEventListener('DOMContentLoaded', init)
const table = document.getElementById('output')
const output_h = document.getElementById('output_h')
const output_b = document.getElementById('output_b')
const dropdownMenu = document.getElementById('dm')
const total_t = document.getElementById('total_t')
const total_m = document.getElementById('total_m')
const total_d = document.getElementById('total_d')
const month = document.getElementById('month')
const dd_month = document.getElementById('dd_month')
const dayCount = document.getElementById('dayCount')

function init() {
    fetch(url)
        .then(res => res.text())
        .then(rep => {
            //Remove additional text and extract only JSON:
            const jsonData = JSON.parse(rep.substring(47).slice(0, -2));
            console.log(jsonData)
            const colz = [];
            const tr = document.createElement('tr');
            //Extract column labels
            jsonData.table.cols.forEach((heading) => {
                if (heading.label) {
                    let column = heading.label;
                    colz.push(column);
                    const th = document.createElement('th');
                    th.innerText = column;
                    tr.appendChild(th);
                    // console.log(column)
                }
            })
            output_h.appendChild(tr);
            //extract row data:
            jsonData.table.rows.forEach((rowData) => {
                const row = {};
                colz.forEach((ele, ind) => {
                    row[ele] = (rowData.c[ind] != null) ? rowData.c[ind].f : '';
                })
                data.push(row);
            })
            processRows(data);
            total_t.innerHTML = jsonData.table.rows[1].c[4].f
            total_m.innerHTML = jsonData.table.rows[4].c[4].f
            total_d.innerHTML = jsonData.table.rows[10].c[4].f
            if (!isInit) dayCount.innerHTML = "DAY" + jsonData.table.rows[13].c[4].f
            isInit = true;
        })
    month.innerHTML = "<b>" + sheetName[month_index] + "</b>"
    var haveNextMonth = (today.getDate() >= 25) ? 2 : 1;
    console.log(today);
    for (var i = 0; i < current_month_index + haveNextMonth; i++) {
        dd_month.innerHTML += '<li><a class="dropdown-item" href="#" id="' + i + '" onClick="ddOnChange(this.id)">' + sheetName[i] + '</a></li>'
    }
}

function processRows(json) {
    var r = 0;
    var next = false;
    json.forEach((row) => {
        const tr = document.createElement('tr');
        const keys = Object.keys(row);
        const oneDay = 24 * 60 * 60 * 1000;
        var d = 0;


        keys.forEach((key) => {
            const td = document.createElement('td');
            var haveData = false;
            td.textContent = row[key];
            if (td.textContent != "" && td.textContent != 0) haveData = true;
            if (d === 0) {
                // console.log("DataDate:" + Date.parse("2023/" + td.textContent) + "[" + td.textContent + "]");
                // console.log("TodayDate:" + Date.parse(todayDate));
                if (Date.parse("2023/" + td.textContent) === Date.parse(todayDate)) {
                    tr.classList = "text-warning";
                } else if (nextDay - Date.parse("2023/" + td.textContent) < oneDay && nextDay - Date.parse("2023/" + td.textContent) > 0) {
                    tr.classList = "text-warning text-opacity-50";
                    next = true;
                } else if (Date.parse("2023/" + td.textContent) > Date.parse(today.toString())) {
                    tr.classList = "text-secondary";
                }
            }
            if (haveData) tr.appendChild(td);
            d++;
        })
        output_b.appendChild(tr);
        r++;
    })
}

function ddOnChange(ddi) {
    console.log(month_index + "," + ddi)
    month.innerHTML = "<b>" + sheetName[ddi] + "</b>";
    month_index = ddi
    url = base + "&sheet=" + sheetName[ddi] + "&tq=" + query;
    clearData();
    init();
}

function clearData() {
    output_h.innerHTML = "";
    output_b.innerHTML = "";
    dd_month.innerHTML = "";
    total_m.innerHTML = "--,---"
    total_t.innerHTML = "--.--"
    total_d.innerHTML = "--"
    data = [];
}