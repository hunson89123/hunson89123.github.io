let commentSortSelected = "default";
const format = date => `${date.getFullYear() - 1911}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

function initCommentPage() {
    const container = document.getElementById('store-comment-list');
    container.innerHTML = '';
    const latestDates = [];
    Object.values(allStoreData).forEach(store => {
        const placeId = store["Place ID"];
        const matchedInfos = allGoogleMapsInfoData.filter(d => d["Place ID"] === placeId).sort((a, b) => new Date(b["資料時間"]) - new Date(a["資料時間"]));
        const mapInfo = matchedInfos[0] || {};
        if (mapInfo["資料時間"]) {
            latestDates.push(new Date(mapInfo["資料時間"]));
        }
        mapInfo.rating = mapInfo ? parseFloat(mapInfo["評分"]) || 0 : 0;
        mapInfo.reviews = mapInfo ? parseInt(mapInfo["評分人數"]) || 0 : 0;

        const card = document.createElement("div");
        card.className = "col-md-4";
        const logoUrl = `./assets/images/stores/logo/${placeId}.png`;
        const reviewLink = `https://search.google.com/local/reviews?placeid=${placeId}`;

        card.innerHTML = `
      <div class="card rounded-3">
        <div class="card-body d-flex align-items-center gap-3" style="height: 100px;">
          ${logoUrl && store["是否有店家圖示"] ? `
            <div style="height: 100%; aspect-ratio: 1/1;">
              <img src="${logoUrl}" alt="Logo" class="rounded-3 shadow-sm" style="height: 100%; width: 100%; object-fit: cover;">
            </div>
          ` : ''}
          <div class="overflow-hidden w-100">
            <h3 class="text-truncate mb-1">${store["店家名稱"]}</h3>
            <h6 class="text-truncate f-w-400 text-secondary mb-0">${store["分店名稱"]}</h6>
          </div>
          <div class="d-flex ms-auto w-50 text-end justify-content-end">
                            <a class="text-muted small" href="${reviewLink}" target="_blank">
                ${mapInfo.reviews > 0 ? `${renderStars(mapInfo.rating)} ${mapInfo.rating}<br/>${mapInfo.reviews} 則評論` : '沒有評論'}
              </a>
          </div>
        </div>
        <div class="d-flex gap-3 w-100 border-top">
          </div>
        </div>
      </div>
    `;
        container.appendChild(card);
    });

    const overallUpdateTime = latestDates.length > 0
        ? new Date(Math.min(...latestDates.map(d => d.getTime())))
        : null;

    if (overallUpdateTime) {
        document.getElementById("comment-data-time").innerText = `${format(overallUpdateTime)}`;
    }
    const sortOption = document.getElementById("commentSortOption");
    sortOption.value = commentSortSelected
    sortOption.addEventListener("change", function () {
        const key = this.value;
        commentSortSelected = key;
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