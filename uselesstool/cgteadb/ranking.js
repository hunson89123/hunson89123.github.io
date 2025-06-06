function getTopCheapDrinks(data) {
    const result = [];

    for (const [brand, drinks] of Object.entries(data)) {
        if (!Array.isArray(drinks) || drinks.length === 0) continue;

        let minPrice = Infinity;
        for (const drink of drinks) {
            const price = Number(drink["價格"]);
            if (price < minPrice) {
                minPrice = price;
            }
        }

        const cheapestList = drinks
            .filter(drink => Number(drink["價格"]) === minPrice)
            .map(drink => ({
                name: drink["飲料名稱"],
                series: drink["飲料系列"]
            }));

        result.push({
            brand,
            price: minPrice,
            drinks: cheapestList
        });
    }

    result.sort((a, b) => a.price - b.price);

    return result;
}

function getTopExpensiveDrinks(data) {
    const result = [];

    for (const [brand, drinks] of Object.entries(data)) {
        if (!Array.isArray(drinks) || drinks.length === 0) continue;

        let maxPrice = -Infinity;
        for (const drink of drinks) {
            const price = Number(drink["價格"]);
            if (price > maxPrice) {
                maxPrice = price;
            }
        }

        const cheapestList = drinks
            .filter(drink => Number(drink["價格"]) === maxPrice)
            .map(drink => ({
                name: drink["飲料名稱"],
                series: drink["飲料系列"]
            }));

        result.push({
            brand,
            price: maxPrice,
            drinks: cheapestList
        });
    }

    result.sort((a, b) => b.price - a.price);

    return result;
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
    ol.innerHTML = ''; // 先清空列表

    const cheapestByBrand = getTopCheapDrinks(allMenuData);

    let prevPrice = null;
    let currentRank = 0;
    cheapestByBrand.forEach(item => {
        if (item.price !== prevPrice) {
            currentRank += 1;        // 見到新的不同價錢，就換下一名
            prevPrice = item.price;
        }
        item.rank = currentRank;   // 不論同價或新價，都把相應名次寫進 item.rank
    });

    // 3) 只取「名次 ≤ 10」的那一批品牌（如果某個名次有很多家平手，也都會被帶進來）
    const top10Ranked = cheapestByBrand.filter(item => item.rank <= 10);

    // 4) 開始把每一筆 item 用 <li> 塞進 <ol> 裡
    top10Ranked.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item";

        // 整理「該品牌底下最便宜的飲料清單」
        // 用 <details open> 讓它預設展開
        let detailsHtml = `
      <details open>
        <summary class="fw-bold">
          ${item.rank}. ${item.brand}
          <small class="text-muted">（共 ${item.drinks.length} 款）</small>
        </summary>
        <ul class="list-unstyled ms-3 mt-2">
    `;
        // 把該品牌最便宜的每一款飲料都列成 <li>
        item.drinks.forEach(drk => {
            detailsHtml += `
        <li class="mb-1">
          <div class="fw-bold">${drk.name} <small class="text-muted">${drk.series}</small></div>
        </li>
      `;
        });
        detailsHtml += `
        </ul>
      </details>
    `;

        // 最後把 detailsHtml + 價錢放到 <li> 內
        li.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        ${detailsHtml}
        <span class="fw-bold">$${item.price}</span>
      </div>
    `;
        ol.appendChild(li);
    });
}

function renderExpensiveList() {
    const tabPane = document.getElementById("expensiveTab");
    const ol = tabPane.querySelector("ol");
    ol.innerHTML = '';

    const cheapestByBrand = getTopExpensiveDrinks(allMenuData);

    let prevPrice = null;
    let currentRank = 0;
    cheapestByBrand.forEach(item => {
        if (item.price !== prevPrice) {
            currentRank += 1;        // 見到新的不同價錢，就換下一名
            prevPrice = item.price;
        }
        item.rank = currentRank;   // 不論同價或新價，都把相應名次寫進 item.rank
    });

    // 3) 只取「名次 ≤ 10」的那一批品牌（如果某個名次有很多家平手，也都會被帶進來）
    const top10Ranked = cheapestByBrand.filter(item => item.rank <= 10);

    // 4) 開始把每一筆 item 用 <li> 塞進 <ol> 裡
    top10Ranked.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item";

        // 整理「該品牌底下最便宜的飲料清單」
        // 用 <details open> 讓它預設展開
        let detailsHtml = `
      <details open>
        <summary class="fw-bold">
          ${item.rank}. ${item.brand}
          <small class="text-muted">（共 ${item.drinks.length} 款）</small>
        </summary>
        <ul class="list-unstyled ms-3 mt-2">
    `;
        // 把該品牌最便宜的每一款飲料都列成 <li>
        item.drinks.forEach(drk => {
            detailsHtml += `
        <li class="mb-1">
          <div class="fw-bold">${drk.name} <small class="text-muted">${drk.series}</small></div>
        </li>
      `;
        });
        detailsHtml += `
        </ul>
      </details>
    `;

        // 最後把 detailsHtml + 價錢放到 <li> 內
        li.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        ${detailsHtml}
        <span class="fw-bold">$${item.price}</span>
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