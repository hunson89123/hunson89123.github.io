const randomSettingModalBody = document.getElementById('randomSettingStores');
const collapseStoresSelectedCount = document.getElementById('collapseStoresSelectedCount');
const collapseStoresCount = document.getElementById('collapseStoresCount');
const countRange = document.getElementById('countRange');
const countRangeLabel = document.getElementById('countRangeLabel');
randomSettingModalBody.innerHTML = '';

const row = document.createElement('div');
row.className = 'row w-100 g-3';

let savedStoreIDs = JSON.parse(localStorage.getItem('selectedStores') || '[]');
if (savedStoreIDs.length === 0) {
    savedStoreIDs = Object.values(allStoreData).map(store => store["Place ID"]);
    localStorage.setItem('selectedStores', JSON.stringify(savedStoreIDs));
}
collapseStoresSelectedCount.innerText = `共${savedStoreIDs.length}家`;
countRange.max = savedStoreIDs.length;
countRange.value = localStorage.getItem('storesCount');
countRangeLabel.textContent = countRange.value;
collapseStoresCount.innerText = `抽${countRange.value}家`;
Object.values(allStoreData).forEach(store => {
    const storeName = store["店家名稱"];
    const storeID = store["Place ID"];

    const col = document.createElement('div');
    col.className = 'col-6 col-md-4';

    const isChecked = savedStoreIDs.includes(storeID) ? 'checked' : '';

    col.innerHTML = `
    <label for="${storeID}" class="card p-3 h-100 cursor-pointer mb-0">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${storeID}" id="${storeID}" ${isChecked}>
        <div class="form-check-label">${storeName}</div>
      </div>
    </label>
  `;

    row.appendChild(col);
});

randomSettingModalBody.appendChild(row);

randomSettingModalBody.addEventListener('change', () => {
    const checked = [...randomSettingModalBody.querySelectorAll('input[type=checkbox]:checked')]
        .map(input => input.value);
    localStorage.setItem('selectedStores', JSON.stringify(checked));
    collapseStoresSelectedCount.innerText = `共${checked.length}家`;
    countRange.max = checked.length;
    countRangeLabel.innerText = countRange.value;
    countRangeLabel.textContent = countRange.value;
    collapseStoresCount.innerText = `抽${countRange.value}家`;
});
countRange.addEventListener('input', () => {
    localStorage.setItem('storesCount', countRange.value);
    countRangeLabel.textContent = countRange.value;
    collapseStoresCount.innerText = `抽${countRange.value}家`;
});