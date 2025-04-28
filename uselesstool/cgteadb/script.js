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
    const card = document.createElement("div");
    card.className = "col-md-4";
    // 取得圖示連結
    const logoUrl = store["店家圖示連結"];
    card.innerHTML = `
    <div class="card rounded-3">
      
      <div class="card-body d-flex align-items-center gap-3" style="height: 100px;">
        
         ${logoUrl && store["菜單已完全加入"] == 'TRUE' ? `
        <div style="height: 100%; aspect-ratio: 1/1; ">
          <img src="${logoUrl}" alt="Logo" class="rounded-3 shadow-sm" style="height: 100%; width: 100%; object-fit: cover;">
        </div>
      ` : ''}

        <div class="overflow-hidden">
          <h2 class="text-truncate mb-1 ${store["菜單已完全加入"] == 'TRUE' ? '' : 'text-secondary'}">${store["店家名稱"]}</h2>
          <h6 class="f-w-400 text-secondary mb-0">${store["分店名稱"]}</h6>
        </div>
        <div class="ms-auto ${store["菜單已完全加入"] == 'TRUE' ? 'd-flex gap-3' : 'd-none'}">
          <button class="btn btn-light rounded-3" data-bs-toggle="modal" data-bs-target="#menuModal" data-name="${store["店家名稱"]}"><i class="bi bi-card-list"></i></button>
          <button class="btn btn-light rounded-3 ${store["菜單圖片連結"] == '' ? 'd-none' : ''}" data-bs-toggle="modal" data-bs-target="#menuImageModal" data-name="${store["店家名稱"]}" data-image-link="${store["菜單圖片連結"] == '' ? '#' : store["菜單圖片連結"]}"><i class="bi bi-image"></i></button>
        </div>
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

    document.getElementById('menuModalLabel').innerText = `${storeName}`;
    const body = document.getElementById('menuModalBody');
    body.innerHTML = `<p>載入中...</p>`;

    const footer = document.getElementById('menuModalFooter');
    footer.innerHTML = '';
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
        <ul class="nav nav-tabs flex-nowrap sticky-top bg-white" role="tablist" style="white-space: nowrap;">
          ${tabTitles}
        </ul>
      </div>

      <div class="overflow-auto" style="max-height: calc(90vh - 230px);">
        <div class="tab-content p-3">
          ${tabContents}
        </div>
      </div>
    `;
      footer.innerHTML = `共 ${Object.keys(grouped).length} 種系列、 ${menuItems.length} 種飲料`;
    } catch (err) {
      body.innerHTML = `<p class="text-muted">此店家菜單尚待加入中</p>`;
    }
  });

  const menuImageModal = document.getElementById('menuImageModal');

  menuImageModal.addEventListener('show.bs.modal', async event => {
    const card = event.relatedTarget;
    const storeName = card.getAttribute('data-name');
    const storeMenuImageLink = card.getAttribute('data-image-link');

    document.getElementById('menuImageModalLabel').innerText = `${storeName}`;
    const body = document.getElementById('menuImageModalBody');
    const footer = document.getElementById('menuImageModalFooter');

    // 先顯示「載入中...」
    body.innerHTML = `<p>載入中...</p>`;

    // 建立一個新的 Image 元素
    const img = new Image();
    img.id = "menuImage";
    img.alt = "菜單圖片";
    img.style.maxWidth = "100%"; // 讓圖片不超出 modal
    img.style.height = "auto";

    // 圖片載入成功後才顯示
    img.onload = function () {
      body.innerHTML = ''; // 清除「載入中」
      body.appendChild(img); // 將圖片放到 modal body 中
    };

    // 圖片載入失敗處理（選擇性加上）
    img.onerror = function () {
      body.innerHTML = `<p class="text-danger">載入失敗，請稍後再試</p>`;
    };

    // 最後設定圖片來源，開始載入
    img.src = storeMenuImageLink;

    const viewer = new Viewer(img, {
      navbar: false,
      title: false,
      toolbar: false,
    });
  });


}


initData();