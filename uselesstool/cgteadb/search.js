function initSearchPage() {
    document.getElementById('searchInput').addEventListener('input',
        function () {
            const input = this.value.trim();
            const keyword = input.toLowerCase();
            const resultArea = document.getElementById('resultArea');
            resultArea.innerHTML = '';

            if (!keyword) return;

            // 定義搜尋條件
            let searchText = '';
            let priceExact = null;
            let priceMin = null;
            let priceMax = null;

            // 判斷是否為價格查詢
            if (/^\$?\d+$/g.test(keyword)) {
                // 單一價格，如 "$60"
                priceExact = parseInt(keyword.replace('$', ''), 10);
            } else if (/^\$?\d+\s*~\s*\$?\d+$/g.test(keyword)) {
                // 價格區間，如 "$50~$70"
                const [min, max] = keyword.replace(/\$/g, '').split('~').map(n => parseInt(n.trim(), 10));
                priceMin = Math.min(min, max);
                priceMax = Math.max(min, max);
            } else {
                searchText = keyword;
            }

            for (const [brand, items] of Object.entries(allMenuData)) {
                const matched = items.filter(item => {
                    const name = item["飲料名稱"].toLowerCase();
                    const price = item["價格"];

                    if (priceExact !== null) {
                        return price === priceExact;
                    } else if (priceMin !== null && priceMax !== null) {
                        return price >= priceMin && price <= priceMax;
                    } else {
                        return name.includes(searchText);
                    }
                });

                if (matched.length > 0) {
                    const brandCard = document.createElement('div');
                    brandCard.className = 'card mb-3';

                    const brandHeader = document.createElement('div');
                    brandHeader.className = 'card-header fw-bold bg-primary text-white p-3';
                    brandHeader.textContent = `${brand}(${matched.length})`;
                    brandCard.appendChild(brandHeader);

                    const listGroup = document.createElement('ul');
                    listGroup.className = 'list-group list-group-flush';

                    matched.forEach(drink => {
                        const item = document.createElement('li');
                        item.className = 'list-group-item';
                        item.innerHTML = `<strong>${drink["飲料名稱"]}</strong> <small class="text-muted">${drink["飲料系列"]}</small> <span class="float-end">$${drink["價格"]}</span>`;
                        listGroup.appendChild(item);
                    });

                    brandCard.appendChild(listGroup);
                    resultArea.appendChild(brandCard);
                }
            }
        });
}
initSearchPage();