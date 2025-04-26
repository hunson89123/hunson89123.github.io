const SHEET_URL = 'https://opensheet.elk.sh/1ykEQFnXG0YqNsgJc3AWxzGU2ePXndbiw8qh9eJawusU/飲料店';

async function getSheetData() {
  const res = await fetch(SHEET_URL);
  const data = await res.json();
  console.log(data);
  return data;
}
async function initData() {
  const container = document.getElementById('store-list');
  const data = await getSheetData();
  console.log(data);
  data.forEach(store => {
    const menuLink = `menu/${store["店家名稱"]}.html`; // 假設你有對應檔案

    const card = document.createElement("div");
    card.className = "col-md-4";
    card.innerHTML = `
          <div class="card cursor-pointer" ${store["菜單已完全加入"] == 'TRUE' ? 'data-bs-toggle="modal" data-bs-target="#menuModal"' : ''}  data-name="${store["店家名稱"]}">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div class="overflow-hidden">
                <h2 class="text-truncate ${store["菜單已完全加入"] == 'TRUE' ? '' : 'text-secondary'}">${store["店家名稱"]}</h2>
                <h6 class="f-w-400 text-secondary">${store["分店名稱"]}</h6>
              </div>
              <i class="h3 bi bi-chevron-right ${store["菜單已完全加入"] == 'TRUE' ? '' : 'text-secondary'} "></i>
            </div>
          </div>
        `;
    container.appendChild(card);
  });

  const menuModal = document.getElementById('menuModal');

  menuModal.addEventListener('show.bs.modal', async event => {
    const card = event.relatedTarget;
    const storeName = card.getAttribute('data-name');
    const menuUrl = `https://opensheet.elk.sh/1ykEQFnXG0YqNsgJc3AWxzGU2ePXndbiw8qh9eJawusU/${encodeURIComponent(storeName)}`;

    document.getElementById('menuModalLabel').innerText = `${storeName} 菜單`;
    const body = document.getElementById('menuModalBody');
    body.innerHTML = `<p>載入中...</p>`;

    try {
      const res = await fetch(menuUrl);
      const menuItems = await res.json();

      // 分組資料
      const grouped = {};
      menuItems.forEach(item => {
        const series = item["飲料系列"] || "未分類";
        if (!grouped[series]) grouped[series] = [];
        grouped[series].push(item);
      });

      // 產生 Tabs 標題列
      const tabTitles = Object.keys(grouped).map((series, idx) => `
      <li class="nav-item" role="presentation">
        <button class="nav-link ${idx === 0 ? 'active' : ''}" id="tab-${idx}" data-bs-toggle="tab" data-bs-target="#pane-${idx}" type="button" role="tab">
          ${series}
        </button>
      </li>
    `).join('');

      // 產生每個 Tab 對應的內容
      const tabContents = Object.entries(grouped).map(([series, items], idx) => `
      <div class="tab-pane fade ${idx === 0 ? 'show active' : ''}" id="pane-${idx}" role="tabpanel">
        <ul class="list-group list-group-flush mt-3">
          ${items.map(item => `
            <li class="list-group-item d-flex justify-content-between">
              <span>${item["飲料名稱"]}</span>
              <span>$${item["價格"]}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

      // 合併成完整 HTML
      body.innerHTML = `
      <div class="overflow-auto">
      <ul class="nav nav-tabs flex-nowrap" role="tablist" style="white-space: nowrap;">
        ${tabTitles}
      </ul>
      </div>
      <div class="tab-content">
        ${tabContents}
      </div>
    `;

    } catch (err) {
      body.innerHTML = `<p class="text-muted">此店家菜單尚待加入中</p>`;
    }
  });
}

initData();