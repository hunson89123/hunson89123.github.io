const GAS_URL = 'https://script.google.com/macros/s/AKfycbxKNauOpCTGKianAEr3AiST-qDMJWxQ4s0kK8rEPorgepinJ-MMWnw8ZSLDRJTZvsFh/exec';
let allStoreData = {};
let allMenuData = {};
let allGoogleMapsInfoData = {};
let googleMapInfoMap = new Map();
let sortSelected = "default";

async function getStoreData() {
  const res = await fetch(`${GAS_URL}?action=getStore`);
  return await res.json();
}

async function getMenuData() {
  const res = await fetch(`${GAS_URL}?action=getMenu`);
  const data = await res.json();
  return data;
}

async function getGoogleMapInfoData() {
  const res = await fetch(`${GAS_URL}?action=getGoogleMapsInfo`);
  const data = await res.json();
  return data;
}
async function initData() {
  showLoading();
  allStoreData = await getStoreData();
  allMenuData = await getMenuData();
  allGoogleMapsInfoData = await getGoogleMapInfoData();
  Object.entries(allStoreData).forEach(([storeName, storeItems], index) => {
    storeItems._originalIndex = index;
  });

  allGoogleMapsInfoData.forEach(info => {
    if (info["Place ID"]) {
      googleMapInfoMap.set(info["Place ID"], info);
    }
  });
  renderCards(allStoreData, googleMapInfoMap);
  hideLoading();

  const menuModal = document.getElementById('menuModal');

  menuModal.addEventListener('show.bs.modal', async event => {
    const card = event.relatedTarget;
    const storeName = card.getAttribute('data-name');

    document.getElementById('menuModalLabel').innerText = `${storeName}`;
    const body = document.getElementById('menuModalBody');
    body.innerHTML = `<p>載入中...</p>`;

    const footer = document.getElementById('menuModalFooter');
    footer.innerHTML = '';
    try {
      const menuItems = allMenuData[storeName] || [];

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

  const storeInfoModal = document.getElementById('storeInfoModal');
  storeInfoModal.addEventListener('show.bs.modal', async event => {
    const card = event.relatedTarget;
    const storeName = card.getAttribute('data-name');

    document.getElementById('storeInfoModalLabel').innerText = `${storeName}`;
    const body = document.getElementById('storeInfoModalBody');
    body.innerHTML = `<p>載入中...</p>`;

    const footer = document.getElementById('menuModalFooter');
    footer.innerHTML = '';
  });
}
function renderCards(data, googleMapInfoMap) {
  const container = document.getElementById('store-list');
  container.innerHTML = '';
  Object.values(data).forEach(store => {
    const placeId = store["Place ID"];
    const mapInfo = googleMapInfoMap.get(placeId);
    store.rating = mapInfo ? parseFloat(mapInfo["評分"]) || 0 : 0;
    store.reviews = mapInfo ? parseInt(mapInfo["評分人數"]) || 0 : 0;

    const card = document.createElement("div");
    card.className = "col-xxl-4 col-xl-6";
    const logoUrl = `./assets/images/stores/logo/${placeId}.png`;
    const reviewLink = `https://search.google.com/local/reviews?placeid=${placeId}`;

    card.innerHTML = `
      <div class="card rounded-3">
        <div class="card-body d-flex align-items-center gap-3" style="height: 100px;">        
          ${logoUrl && store["是否有店家圖示"] ? `
            <div style="height: 100%; aspect-ratio: 1/1;" class="cursor-pointer" data-name="${store["店家名稱"]}" data-bs-toggle="modal" data-bs-target="#storeInfoModal">
              <img src="${logoUrl}" alt="Logo" class="rounded-3 shadow-sm" style="height: 100%; width: 100%; object-fit: cover;">
            </div>
          ` : ''}
          <div class="overflow-hidden w-100 cursor-pointer" data-name="${store["店家名稱"]}" data-bs-toggle="modal" data-bs-target="#storeInfoModal">
            <h3 class="text-truncate mb-1">${store["店家名稱"]}</h3>
            <h6 class="text-truncate f-w-400 text-secondary mb-0">${store["分店名稱"]}</h6>
          </div>
          <div class="d-flex ms-auto w-50 text-end justify-content-end">
               <button class="btn btn-link text-dark"
          data-bs-toggle="modal"
          data-bs-target="#menuModal"
          data-name="${store["店家名稱"]}"
          ${store["菜單已完全加入"] ? '' : 'disabled'}
          >
            <i class="bi bi-journal-text"></i>
          </button>
          <button class="btn btn-link text-dark btn-menu-viewer" 
            data-name="${store["店家名稱"]}" 
            data-image-link="${!store["是否有菜單圖片"] ? '#' : `./assets/images/stores/menu/${placeId}.png`}"
            ${store["是否有菜單圖片"] ? '' : 'disabled'}>
            <i class="bi bi-file-image"></i>
          </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  const sortOption = document.getElementById("sortOption");
  sortOption.value = sortSelected
  sortOption.addEventListener("change", function () {
    const key = this.value;
    sortSelected = key;
    if (key === "default") {
      allStoreData.sort((a, b) => a._originalIndex - b._originalIndex);
    } else if (key.endsWith("-reverse")) {
      const baseKey = key.replace("-reverse", "");
      allStoreData.sort((a, b) => a[baseKey] - b[baseKey]);
    } else {
      allStoreData.sort((a, b) => b[key] - a[key]);
    }
    renderCards(allStoreData, googleMapInfoMap);
  });

  document.querySelectorAll('.btn-menu-viewer').forEach(btn => {
    btn.addEventListener('click', () => {
      const imgUrl = btn.getAttribute('data-image-link');
      if (!imgUrl || imgUrl === '#') return;

      const img = new Image();
      img.src = imgUrl;
      img.id = 'menuImage';
      img.alt = '菜單圖片';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';

      img.onload = () => {
        const viewer = new Viewer(img, {
          navbar: false,
          title: false,
          toolbar: false,
          toggleOnDblclick: false,
          transition: false
        });
        viewer.show();
      };

      img.onerror = () => {
        console.error('圖片載入失敗:', imgUrl);
        alert('載入失敗，請稍後再試');
      };
    });
  });
}




function initHomePage() {
  initData();
}
