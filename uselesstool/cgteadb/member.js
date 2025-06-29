function initMemberPage(onlyWithMemberLink = true) {
  const latestDates = [];
  const rows = [];

  Object.values(allStoreData).forEach(store => {
    const placeId = store["Place ID"];
    const matchedInfos = allGoogleMapsInfoData
      .filter(d => d["Place ID"] === placeId)
      .sort((a, b) => new Date(b["資料時間"]) - new Date(a["資料時間"]));
    const mapInfo = matchedInfos[0] || {};

    if (mapInfo["資料時間"]) {
      latestDates.push(new Date(mapInfo["資料時間"]));
    }

    const memberLink = store["會員連結"] ?? "";
    const memberLinkTypeMap = {
      "https://ocard.co": "Ocard",
      "https://order.nidin.shop": "你訂",
      "https://line.me": "LINE@",
    };

    let memberLinkType = '';
    if (memberLink !== '') {
      const matchedKey = Object.keys(memberLinkTypeMap).find(prefix => memberLink.startsWith(prefix));
      memberLinkType = matchedKey ? memberLinkTypeMap[matchedKey] : '其他平台';
    }

    if (onlyWithMemberLink && memberLink === '') return;

    rows.push({
      name: store["店家名稱"],
      memberLink: memberLink ? { url: memberLink, type: memberLinkType } : null,
      threshold: parseInt(store["集點門檻(元/點)"]),
      minPoint: parseInt(store["最低兌換點數(點)"]),
      minAmount: parseFloat(store["最低兌換折抵(元)"]),
      rate: parseFloat(store["實際回饋率"]) * 100.0,
      expire: parseInt(store["點數期限(天)"]),
      expireNote: store["點數期限備註"] || null
    });
  });
  $('#table').bootstrapTable('destroy').bootstrapTable({ data: rows })
    .on('post-body.bs.table', function () {
      initTooltips();
    });

  initTooltips();

  document.getElementById('flexCheckDefault').addEventListener('change', function () {
    const showOnlyWithLink = this.checked;
    initMemberPage(showOnlyWithLink);
  });

}

function memberLinkFormatter(value, row, index) {
  if (!value || !value.url) return '';
  const iconClass = value.type ? 'bi bi-box-arrow-up-right' : '';
  return `<a href="${value.url}" target="_blank">${value.type}<span class="${iconClass}"></span></a>`;
}

function rateFormatter(value) {
  return `${value.toFixed(2)}%`;
}

function expireFormatter(value, row, index) {
  if (!row.expireNote) return value; // 沒備註就單純顯示天數

  return `
    ${value}
    <span tabindex="0" class="text-primary ms-1 cursor-pointer" 
          data-bs-toggle="tooltip" 
          data-bs-trigger="focus"
          title="${row.expireNote}">
      [?]
    </span>
  `;
}

function initTooltips() {
  const oldTooltips = bootstrap.Tooltip.getInstance
    ? document.querySelectorAll('[data-bs-toggle="tooltip"]')
    : [];

  oldTooltips.forEach(el => {
    const instance = bootstrap.Tooltip.getInstance(el);
    if (instance) instance.dispose();
  });

  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => {
    new bootstrap.Tooltip(el);
  });
}

