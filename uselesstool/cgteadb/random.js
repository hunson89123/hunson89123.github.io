let drawStoreLists = [];
let drawStoreCount = 1;

function initRandomPage() {
  const row = document.createElement('div');
  row.className = 'row w-100 g-3';
  const randomSettingModalBody = document.getElementById('randomSettingStores');
  const collapseStoresSelectedCount = document.getElementById('collapseStoresSelectedCount');
  const collapseStoresCount = document.getElementById('collapseStoresCount');
  const countRange = document.getElementById('countRange');
  const countRangeLabel = document.getElementById('countRangeLabel');
  const drawBtn = document.getElementById('drawBtn');

  randomSettingModalBody.innerHTML = '';
  let savedStores = JSON.parse(localStorage.getItem('selectedStores') || '[]');

  if (savedStores.length === 0) {
    savedStores = Object.values(allStoreData).map(store => ({
      name: store["店家名稱"],
      placeId: store["Place ID"]
    }));
    localStorage.setItem('selectedStores', JSON.stringify(savedStores));
  }
  collapseStoresSelectedCount.innerText = `共${savedStores.length}家`;
  countRange.max = savedStores.length;
  countRange.value = localStorage.getItem('storesCount') ?? 1;
  countRangeLabel.textContent = countRange.value;
  collapseStoresCount.innerText = `抽${countRange.value}家`;
  drawStoreLists = savedStores.map(store => store.name);
  drawStoreCount = countRange.value;
  Object.values(allStoreData).forEach(store => {
    const storeName = store["店家名稱"];
    const storeID = store["Place ID"];

    const col = document.createElement('div');
    col.className = 'col-12 col-md-4';

    const isChecked = savedStores.some(store => store.placeId === storeID) ? 'checked' : '';

    col.innerHTML = `
    <label for="${storeID}" class="card p-2 h-100 cursor-pointer mb-0">
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
    drawStoreLists = savedStores.map(store => store.name);
  });
  countRange.addEventListener('input', () => {
    localStorage.setItem('storesCount', countRange.value);
    countRangeLabel.textContent = countRange.value;
    collapseStoresCount.innerText = `抽${countRange.value}家`;
    drawStoreCount = countRange.value;
  });


}

function drawStores() {
  const rawList = drawStoreLists;
  const count = drawStoreCount;
  const resultsDiv = document.getElementById('results');
  drawBtn.disabled = true;
  drawBtn.textContent = '決定喝啥中...'
  if (rawList.length === 0 || isNaN(count) || count < 1) {
    resultsDiv.innerHTML = '<p style="color:red">請輸入有效的店家清單與抽取數量</p>';
    return;
  }

  const available = [...rawList]; // 複製一份避免重複
  const selected = [];

  resultsDiv.innerHTML = '';

  let index = 0;
  function animateAndShow() {
    const randomIndex = Math.floor(Math.random() * available.length);
    const store = available.splice(randomIndex, 1)[0];
    selected.push(store);

    const rollingText = document.createElement('li');
    rollingText.className = 'rolling-text list-group-item';
    resultsDiv.appendChild(rollingText);

    let rollCount = 10;
    let interval = setInterval(() => {
      const randomName = rawList[getSecureRandomInt(rawList.length)];
      rollingText.textContent = randomName;
      rollCount--;
      if (rollCount <= 0) {
        clearInterval(interval);
        rollingText.remove();

        const p = document.createElement('li');
        p.textContent = store;
        p.className = 'list-group-item list-group-item-action cursor-pointer draw-highlight';
        resultsDiv.appendChild(p);
      }
    }, 50);
  }

  function startNext() {
    if (index < count && available.length > 0) {
      animateAndShow();
      index++;
      setTimeout(startNext, 500);
    } else {
      drawBtn.disabled = false;
      drawBtn.textContent = '喝啥?'
    }
  }

  function getSecureRandomInt(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }
  startNext();
}