function getTopCheapDrinks(data, topN = 10) {
    const allDrinks = [];
    for (const [brand, drinks] of Object.entries(data)) {
        drinks.forEach(drink => {
            allDrinks.push({
                brand,
                name: drink["飲料名稱"],
                series: drink["飲料系列"],
                price: drink["價格"]
            });
        });
    }

    console.log(allDrinks);
    return allDrinks
        .sort((a, b) => a.price - b.price)
        .slice(0, topN);
}

function getTopExpensiveDrinks(data, topN = 10) {
    const allDrinks = [];

    for (const [brand, drinks] of Object.entries(data)) {
        drinks.forEach(drink => {
            allDrinks.push({
                brand,
                name: drink["飲料名稱"],
                series: drink["飲料系列"],
                price: drink["價格"]
            });
        });
    }

    return allDrinks
        .sort((a, b) => b.price - a.price)
        .slice(0, topN);
}

function getTopMostItems(data, topN = 10) {
    const brandCounts = Object.entries(data).map(([brand, drinks]) => ({
        brand,
        count: drinks.length
    }));

    return brandCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
}

function getTopLeastItems(data, topN = 10) {
    const brandCounts = Object.entries(data).map(([brand, drinks]) => ({
        brand,
        count: drinks.length
    }));

    return brandCounts
        .sort((a, b) => a.count - b.count)
        .slice(0, topN);
}


// 渲染排行榜
function renderCheapList() {
    const tabPane = document.getElementById("cheapTab");
    const ol = tabPane.querySelector("ol");
    ol.innerHTML = '';

    const cheapDrinks = getTopCheapDrinks(allMenuData, 10);

    cheapDrinks.forEach(drink => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-start align-items-center";
        li.innerHTML = `
        <div class="d-flex align-items-center w-100 justify-content-between">
            <div class="d-flex flex-column flex-md-row ms-3 align-items-start align-items-md-center">
                <div class="fw-bold text-start">${drink.name}</div>
                <small class="text-muted text-start">${drink.brand}・${drink.series}</small>
            </div>
            <span class="float-end">$${drink.price}</span>
        </div>`;
        ol.appendChild(li);
    });
}

function renderExpensiveList() {
    const tabPane = document.getElementById("expensiveTab");
    const ol = tabPane.querySelector("ol");
    ol.innerHTML = '';

    const topDrinks = getTopExpensiveDrinks(allMenuData, 10);

    topDrinks.forEach(drink => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-start align-items-center";
        li.innerHTML = `
        <div class="d-flex align-items-center w-100 justify-content-between">
            <div class="d-flex flex-column flex-md-row ms-3 align-items-start align-items-md-center">
            <div class="fw-bold text-start">${drink.name}</div>
            <small class="text-muted text-start">${drink.brand}・${drink.series}</small>
            </div>
            <span class="float-end">$${drink.price}</span>
        </div>
        `;
        ol.appendChild(li);
    });
}

function renderMostItemsList() {
    const tabPane = document.getElementById("mostTab");
    const ol = tabPane.querySelector("ol");
    ol.innerHTML = '';

    const topBrands = getTopMostItems(allMenuData, 10);

    topBrands.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
        <div class="fw-bold text-start">${item.brand}</div>
        <span class="badge bg-primary rounded-pill">${item.count} 項飲品</span>
        `;
        ol.appendChild(li);
    });
}


function renderLeastItemsList() {
    const tabPane = document.getElementById("leastTab");
    const ol = tabPane.querySelector("ol");
    ol.innerHTML = '';

    const topBrands = getTopLeastItems(allMenuData, 10);

    topBrands.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
        <div class="fw-bold text-start">${item.brand}</div>
        <span class="badge bg-secondary rounded-pill">${item.count} 項飲品</span>
        `;
        ol.appendChild(li);
    });
}



function initRankingPage() {
    renderCheapList();
    renderExpensiveList();
    renderMostItemsList();
    renderLeastItemsList();
}

initRankingPage();