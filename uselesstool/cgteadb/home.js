const GAS_URL = 'https://script.google.com/macros/s/AKfycbwS-k0t4XQ0sn7jGM3g5jLl8wDB87lVgT2cNsTSqqDiS227ypeGfYwxiSKAcCGLZHzA/exec';
let allStoreData = {};
let allMenuData = {};
let allGoogleMapsInfoData = {};
let googleMapInfoMap = new Map();
let sortSelected = "default";

async function getStoreData(forceUpdate = false) {
  const cacheKey = 'storeData';
  if (!forceUpdate) {
    const cached = loadFromLocalStorage(cacheKey);
    if (cached) return cached;
  }
  showLoading('取得店家資訊中');
  const res = await fetch(`${GAS_URL}?action=getStore`);
  const data = await res.json();
  saveToLocalStorage(cacheKey, data);
  return data;
}

async function getMenuData(forceUpdate = false) {
  const cacheKey = 'menuData';
  if (!forceUpdate) {
    const cached = loadFromLocalStorage(cacheKey);
    if (cached) return cached;
  }
  showLoading('取得菜單資訊中');
  const res = await fetch(`${GAS_URL}?action=getMenu`);
  const data = await res.json();
  saveToLocalStorage(cacheKey, data);
  return data;
}

async function getGoogleMapInfoData(forceUpdate = false) {
  const cacheKey = 'googleMapInfoData';
  if (!forceUpdate) {
    const cached = loadFromLocalStorage(cacheKey);
    if (cached) return cached;
  }
  showLoading('取得評論資訊中');
  const res = await fetch(`${GAS_URL}?action=getGoogleMapsInfo`);
  const data = await res.json();
  saveToLocalStorage(cacheKey, data);
  return data;
}

async function initData(forceUpdate = false) {
  showLoading();
  allStoreData = await getStoreData(forceUpdate);
  allMenuData = await getMenuData(forceUpdate);
  allGoogleMapsInfoData = await getGoogleMapInfoData(forceUpdate);
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
    const branchName = card.getAttribute('data-branch');

    document.getElementById('menuModalLabel').innerHTML = `${storeName} <small class="text-secondary">${branchName}</small>`;
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
    const storePlaceId = card.getAttribute('data-place-id');
    const storeName = card.getAttribute('data-name');
    const branchName = card.getAttribute('data-branch');

    document.getElementById('storeInfoModalLabel').innerHTML = `${storeName} <small class="text-secondary">${branchName}</small>`;
    const body = document.getElementById('storeInfoModalBody');
    body.innerHTML = `<p>載入中...</p>`;

    const footer = document.getElementById('storeInfoModalFooter');
    footer.innerHTML = '';


    try {
      const storeItem = allStoreData.find(x => x["Place ID"] === storePlaceId) || {};
      body.innerHTML = `
        <div class="row my-3">
          <div class="col-auto"><i class="bi bi-geo-alt h5"></i></div>
          <div class="col">
            <a href="https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(storeItem["Place ID"])}" 
              target="_blank" 
              class="text-decoration-none">
              ${storeItem.地址}
            </a>
            (<a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeItem.店家地址)}&destination_place_id=${encodeURIComponent(storeItem["Place ID"])}" 
              target="_blank" 
              class="text-decoration-none">
              <i class="bi bi-sign-turn-right-fill"></i>立即出發
            </a>)
          </div>
        </div>
        <div class="row my-3 ${storeItem.電話號碼 === '無提供' ? 'd-none' : ''}">
          <div class="col-auto"><i class="bi bi-telephone h5"></i></div>
          <div class="col">
            <a href="tel:${storeItem.電話號碼}" class="text-decoration-none">
              ${storeItem.電話號碼}
            </a>
          </div >
        </div>
        <div class="row my-3">
          <div class="col-auto"><i class="bi bi-clock h5"></i></div>
          <div class="col">${formatOpeningHoursWithStatus(storeItem.營業時間).html}</div >
        </div>
        <div class="row my-3 ${formatDateToYMD(storeItem.開幕時間) ? '' : 'd-none'}">
          <div class="col-auto"><i class="bi bi-calendar3-event h5"></i></div>
          <div class="col">${formatDateToYMD(storeItem.開幕時間)}(<a href="${storeItem.開幕時間來源網址}" target="_blank">開幕時間來源</a>)</div >
        </div>
      `;
    } catch (err) {
      body.innerHTML = `<p class="text-muted">尚無店家資訊，敬請期待</p>`;
    }
  });
}

function getRightContent(store, placeId, showOption) {
  const reviewLink = `https://search.google.com/local/reviews?placeid=${placeId}`;
  switch (showOption) {
    case 'reviews':
      return `
      <a href="${reviewLink}" target="_blank" class="text-decoration-none text-dark">
        <small>${renderStars(store["rating"], store["reviews"]) ?? "無資料"}</small>
      </a>
      `;
    case '開幕時間':
      return `<small>${formatDateToYMD(store["開幕時間"])}</small>`;
    case 'menu':
    default:
      return `<button class="btn btn-link text-dark"
                data-bs-toggle="modal"
                data-bs-target="#menuModal"
                data-name="${store["店家名稱"]}"
                data-branch="${store["分店名稱"]}"
                data-place-id="${store["Place ID"]}"
                ${store["菜單已完全加入"] ? '' : 'hidden'}>
                <i class="bi bi-journal-text"></i>
              </button>
              <button class="btn btn-link text-dark btn-menu-viewer"
                data-name="${store["店家名稱"]}"
                data-image-link="${!store["是否有菜單圖片"] ? '#' : `./assets/images/stores/menu/${placeId}.png`}"
                data-place-id="${store["Place ID"]}"
                ${store["是否有菜單圖片"] ? '' : 'hidden'}>
                <i class="bi bi-file-image"></i>
              </button>`;
  }
}


async function renderCards(data, googleMapInfoMap) {
  const container = document.getElementById('store-list');
  container.innerHTML = '';
  Object.values(data).forEach(store => {
    const placeId = store["Place ID"];
    const mapInfo = googleMapInfoMap.get(placeId);
    const showOption = document.getElementById("showOption").value;
    store.rating = mapInfo ? parseFloat(mapInfo["評分"]) || 0 : 0;
    store.reviews = mapInfo ? parseInt(mapInfo["評分人數"]) || 0 : 0;

    const card = document.createElement("div");
    card.className = "col-xxl-4 col-xl-6";
    const logoUrl = `./assets/images/stores/logo/${placeId}.png`;
    const isOpenNowBorder = ['border-light-gray', 'border-success', 'border-danger', 'border']
    card.innerHTML = `
      <div class="card rounded-3 position-relative ${isOpenNowBorder[Number(formatOpeningHoursWithStatus(store["營業時間"]).isOpenNow)]}">
        <div class="card-body d-flex align-items-center" style="height: 100px;">
          <div class="d-flex justify-content-center align-items-center w-100 cursor-pointer" data-name="${store["店家名稱"]}" data-branch="${store["分店名稱"]}" data-place-id="${store["Place ID"]}" data-bs-toggle="modal" data-bs-target="#storeInfoModal">
            ${logoUrl && store["是否有店家圖示"] ? `
              <div class="position-relative" style="height:100%; aspect-ratio: 1/1;">
                <img src="${logoUrl}" alt="Logo" class="rounded-3 shadow-sm" style="height: auto; width:clamp(50px, 10vw, 60px); object-fit: cover;">
              </div>
            ` : ''}
            <div class="overflow-hidden w-100 ms-3">
              <h3 class="text-truncate mb-1">${store["店家名稱"]}</h3>
              <h6 class="text-truncate f-w-400 text-secondary mb-0">${store["分店名稱"]}</h6>
            </div>
          </div>
          <div class="d-flex ms-auto text-end justify-content-end text-nowrap">
            ${getRightContent(store, placeId, showOption)}
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  const sortOption = document.getElementById("sortOption");
  sortOption.value = sortSelected

  sortOption.addEventListener("change", async function () {
    const key = this.value;
    sortSelected = key;
    if (key === "default") {
      allStoreData.sort((a, b) => a._originalIndex - b._originalIndex);
    } else if (key === "開幕時間") {
      allStoreData.sort((a, b) => new Date(b["開幕時間"]) - new Date(a["開幕時間"])); // 新→舊
    } else if (key === "開幕時間-reverse") {
      allStoreData.sort((a, b) => new Date(a["開幕時間"]) - new Date(b["開幕時間"])); // 舊→新
    } else if (key.endsWith("-reverse")) {
      const baseKey = key.replace("-reverse", "");
      allStoreData.sort((a, b) => a[baseKey] - b[baseKey]);
    } else {
      allStoreData.sort((a, b) => b[key] - a[key]);
    }
    await renderCards(allStoreData, googleMapInfoMap);
  });

  document.getElementById("showOption").addEventListener("change", async () => {
    await renderCards(allStoreData, googleMapInfoMap);
  });

  document.querySelectorAll('.btn-menu-viewer').forEach(btn => {
    btn.addEventListener('click', () => {
      showLoading();
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
          transition: false,
          loading: true
        });
        viewer.show();
        hideLoading();
      };

      img.onerror = () => {
        alert('載入失敗，請稍後再試');
        hideLoading();
      };
    });
  });
}

function renderStars(rating, reviews) {
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
  return `${parseFloat(rating).toFixed(1)} ${stars.join('')}<br>${reviews}則評論`;
}

function formatDateToYMD(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return false;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從0開始
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}<br>${timeAgo(dateStr)}`;
}

function timeAgo(dateStr) {
  const timestamp = new Date(dateStr).getTime();
  const now = Date.now();
  const difference = now - timestamp;

  const seconds = difference / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const months = days / 30.44;
  const years = days / 365.25;

  if (years >= 1) {
    return `${years.toFixed(1)} 年前`;
  } else if (months >= 1) {
    return `${months.toFixed(1)} 個月前`;
  } else if (days >= 1) {
    return `${Math.floor(days)} 天前`;
  } else if (hours >= 1) {
    return `${Math.floor(hours)} 小時前`;
  } else if (minutes >= 1) {
    return `${Math.floor(minutes)} 分鐘前`;
  } else {
    return `${Math.floor(seconds)} 秒前`;
  }
}

function formatOpeningHoursWithStatus(hoursText) {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const todayIdx = new Date().getDay();
  const today = days[todayIdx];
  const now = new Date();

  let isOpenNow = 0;

  const formatted = hoursText.split('\n').map(line => {
    const [day, timeRange] = line.split(': ');
    const isToday = day === today;
    if (isToday) {
      if (timeRange && timeRange.includes('–')) {
        const [openStr, closeStr] = timeRange.split(' – ');
        const [openH, openM] = openStr.split(':').map(Number);
        const [closeH, closeM] = closeStr.split(':').map(Number);

        const openTime = new Date(now);
        openTime.setHours(openH, openM, 0, 0);

        const closeTime = new Date(now);
        closeTime.setHours(closeH, closeM, 0, 0);

        // 處理營業時間跨午夜
        if (closeTime <= openTime) {
          closeTime.setDate(closeTime.getDate() + 1);
        }

        isOpenNow = now >= openTime && now <= closeTime;
        const statusClass = isOpenNow ? "bg-primary" : "bg-secondary";
        return `<b class="text-light ${statusClass}">${line}</b>`;
      } else {
        isOpenNow = 2;
        return `<b class="text-secondary">${line}</b>`;
      }
    }

    return line;
  }).join('<br>');
  if (hoursText === '無提供' || hoursText === '') isOpenNow = 3;
  return {
    html: formatted,
    isOpenNow: isOpenNow
  };
}

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify({
    timestamp: Date.now(),
    data: data
  }));
  localStorage.setItem('lastUpdated', Date.now());
}

function loadFromLocalStorage(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    const parsed = JSON.parse(item);
    return parsed.data;
  } catch {
    return null;
  }
}

function updateLastUpdatedDisplay() {
  const timestamp = localStorage.getItem('lastUpdated');
  const el = document.getElementById('lastUpdatedTime');
  if (!el) return;

  if (timestamp) {
    const date = new Date(parseInt(timestamp));
    const formatted = date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    el.textContent = `上次更新：${timeAgo(formatted)}`;
  } else {
    el.textContent = '尚未更新過資料';
  }
}

function initHomePage() {
  initData();
}
