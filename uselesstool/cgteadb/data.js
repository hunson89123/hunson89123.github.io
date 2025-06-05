
function initDataPage() {
    console.log(allStoreData.length);
    console.warn(allGoogleMapsInfoData);
    console.info(allMenuData)
    const seriesSet = new Set();
    let totalDrinkCount = 0;
    let totalPrice = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const store in allMenuData) {
        const menuItems = allMenuData[store];

        menuItems.forEach(item => {
            // 統計系列
            if (item.飲料系列) {
                seriesSet.add(item.飲料系列);
            }

            // 統計價格與數量
            if (typeof item.價格 === 'number') {
                totalDrinkCount++;
                totalPrice += item.價格;
                if (item.價格 < minPrice) minPrice = item.價格;
                if (item.價格 > maxPrice) maxPrice = item.價格;
            }
        });
    }

    const avgPrice = totalDrinkCount > 0 ? (totalPrice / totalDrinkCount) : 0;

    const entries = [
        ['store-count', allStoreData.length],
        ['series-count', seriesSet.size],
        ['item-count', totalDrinkCount],
        ['min-price', minPrice],
        ['max-price', maxPrice],
        ['avg-price', avgPrice.toFixed(1)]
    ];

    entries.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (!el) return;

        el.innerText = value;
    });
}
