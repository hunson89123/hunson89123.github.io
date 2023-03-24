const sheetId = '1f7uWyeLwEJvDdf0yP8hrHo63Nlx9d2rOfRdHwP6scF4';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = ['2023/03', '2023/04'];
const query = encodeURIComponent('Select *')
const url = `${base}&sheet=${sheetName[0]}&tq=${query}`
const data = []
document.addEventListener('DOMContentLoaded', init)
const output_h = document.getElementById('output_h')
const output_b = document.getElementById('output_b')
const dropdownMenu = document.getElementById('dm')
const total_t = document.getElementById('total_t')
const total_m = document.getElementById('total_m')
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
            total_m.innerHTML = jsonData.table.rows[1].c[5].f
        })
}

function processRows(json) {
    json.forEach((row) => {
        const tr = document.createElement('tr');
        const keys = Object.keys(row);

        keys.forEach((key) => {
            const td = document.createElement('td');
            td.textContent = row[key];
            tr.appendChild(td);
        })
        output_b.appendChild(tr);
    })
}

function GoogleDate(JSdate) {
    var D = new Date(JSdate);
    // console.log(D);
    var Null = new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0)); // the starting value for Google
    return ((D.getTime() - Null.getTime()) / 60000 - D.getTimezoneOffset()) / 1440;
}