
import { CountUp } from './assets/js/countUp.min.js';

function initDataPage() {
    const seriesSet = new Set();
    let totalDrinkCount = 0;
    let totalPrice = 0;
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const store in allMenuData) {
        const menuItems = allMenuData[store];

        menuItems.forEach(item => {
            if (item.飲料系列) {
                seriesSet.add(item.飲料系列);
            }

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

        const decimalPlaces = (typeof value === 'string' && value.includes('.')) ||
            (typeof value === 'number' && !Number.isInteger(value)) ? 1 : 0;

        const countUp = new CountUp(id, value, {
            duration: 1.5,
            separator: ',',
            decimalPlaces: decimalPlaces
        });

        if (!countUp.error) {
            countUp.start();
        } else {
            console.error(countUp.error);
            el.innerText = value; // fallback 顯示
        }
    });
}

window.initDataPage = initDataPage;