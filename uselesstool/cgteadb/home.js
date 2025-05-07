const SHEET_URL = 'https://opensheet.elk.sh/1ykEQFnXG0YqNsgJc3AWxzGU2ePXndbiw8qh9eJawusU/飲料店';
const GOOGLEMAPINFO_SHEET_URL = 'https://opensheet.elk.sh/1ykEQFnXG0YqNsgJc3AWxzGU2ePXndbiw8qh9eJawusU/GoogleMaps資訊';
async function getSheetData() {
  const res = await fetch(SHEET_URL);
  const data = await res.json();
  return data;
}

async function getGoogleMapInfoData() {
  const res = await fetch(GOOGLEMAPINFO_SHEET_URL);
  const data = await res.json();
  return data;
}
async function initData() {
  const container = document.getElementById('store-list');
  const data = await getSheetData();
  const googleMapInfoData = await getGoogleMapInfoData();
  const googleMapInfoMap = new Map();
  data.forEach((store, index) => {
    store._originalIndex = index;
  });
  googleMapInfoData.forEach(info => {
    if (info["Place ID"]) {
      googleMapInfoMap.set(info["Place ID"], info);
    }
  });
  renderCards(data, googleMapInfoMap);


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

      const grouped = {};
      menuItems.forEach(item => {
        const series = item["飲料系列"] || "未分類";
        if (!grouped[series]) grouped[series] = [];
        grouped[series].push(item);
      });

      const tabTitles = Object.keys(grouped).map((series, idx) => `
      <li class="nav-item" role="presentation">
        <button class="nav-link ${idx === 0 ? 'active' : ''}" id="tab-${idx}" data-bs-toggle="tab" data-bs-target="#pane-${idx}" type="button" role="tab">
          ${series}
        </button>
      </li>
    `).join('');

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

    new Viewer(img, {
      navbar: false,
      title: false,
      toolbar: false,
      toggleOnDblclick: false,
    });
  });

  document.getElementById("sortOption").addEventListener("change", function () {
    const key = this.value;
    if (key === "default") {
      data.sort((a, b) => a._originalIndex - b._originalIndex);
    } else if (key.endsWith("-reverse")) {
      const baseKey = key.replace("-reverse", "");
      data.sort((a, b) => a[baseKey] - b[baseKey]);
    } else {
      data.sort((a, b) => b[key] - a[key]);
    }
    renderCards(data, googleMapInfoMap);
  });
}
function renderCards(data, googleMapInfoMap) {
  const container = document.getElementById('store-list');
  container.innerHTML = '';

  data.forEach(store => {
    const placeId = store["Place ID"];
    const mapInfo = googleMapInfoMap.get(placeId);
    store.rating = mapInfo ? parseFloat(mapInfo["評分"]) || 0 : 0;
    store.reviews = mapInfo ? parseInt(mapInfo["評分人數"]) || 0 : 0;

    const card = document.createElement("div");
    card.className = "col-md-4";
    const logoUrl = `./assets/images/stores/logo/${placeId}.png`;
    const reviewLink = `https://search.google.com/local/reviews?placeid=${placeId}`;

    card.innerHTML = `
      <div class="card rounded-3">
        <div class="card-body d-flex align-items-center gap-3" style="height: 100px;">
          ${logoUrl && store["是否有店家圖示"] == 'TRUE' ? `
            <div style="height: 100%; aspect-ratio: 1/1;">
              <img src="${logoUrl}" alt="Logo" class="rounded-3 shadow-sm" style="height: 100%; width: 100%; object-fit: cover;">
            </div>
          ` : ''}
          <div class="overflow-hidden w-100">
            <h3 class="text-truncate mb-1">${store["店家名稱"]}</h3>
            <h6 class="f-w-400 text-secondary mb-0">${store["分店名稱"]}</h6>
          </div>
          <div class="d-flex ms-auto w-50 text-end justify-content-end">
              <a class="text-muted small" href="${reviewLink}" target="_blank">
                ${store.reviews > 0 ? `${renderStars(store.rating)} ${store.rating}<br/>${store.reviews} 則評論` : '沒有評論'}
              </a>
          </div>
        </div>
        <div class="d-flex gap-3 w-100 border-top">
          <button class="btn btn-link btn-sm text-dark flex-fill border-end"
          data-bs-toggle="modal"
          data-bs-target="#menuModal"
          data-name="${store["店家名稱"]}"
          ${store["菜單已完全加入"] == 'TRUE' ? '' : 'disabled'}
          >
            <i class="bi bi-card-list me-2"></i>清單檢視
          </button>
          <button class="btn btn-link btn-sm text-dark flex-fill" 
            data-bs-toggle="modal" data-bs-target="#menuImageModal" 
            data-name="${store["店家名稱"]}" 
            data-image-link="${store["是否有菜單圖片"] == 'FALSE' ? '#' : `./assets/images/stores/menu/${placeId}.png`}"
            ${store["是否有菜單圖片"] == 'TRUE' ? '' : 'disabled'}>
            <i class="bi bi-image me-2"></i>菜單圖片
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}


function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i - 0.2) {
      stars.push('<i class="bi bi-star-fill text-warning"></i>');
    } else if (rating >= i - 0.7) {
      stars.push('<i class="bi bi-star-half text-warning"></i>');
    } else {
      stars.push('<i class="bi bi-star text-warning"></i>');
    }
  }
  return stars.join('');
}

function initHomePage() {
  initData();
}
