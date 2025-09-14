// === 旅程日期 ===
const TZ_OFFSET = '+09:00'; // 日本時區
const TRIP_START = new Date('2025-12-25T13:30:00' + TZ_OFFSET);
const TRIP_END = new Date('2026-01-01T18:40:40' + TZ_OFFSET);

// === 倒數計時 ===
const countdownEl = document.getElementById('countdown');
const statusEl = document.getElementById('countdownStatus');
const progressBar = document.getElementById('progressBar');

function fmt(n) { return String(n).padStart(2, '0'); }
function renderCountdown(d, h, m, s) {
    countdownEl.innerHTML = '' +
        block(fmt(d), '天') +
        block(fmt(h), '小時') +
        block(fmt(m), '分鐘') +
        block(fmt(s), '秒');
}
function block(value, label) {
    return `<div class="block"><div class="digit" aria-label="${label}">${value}</div><div class="label">${label}</div></div>`;
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function tick() {
    const now = new Date();
    if (now < TRIP_START) {
        const diff = TRIP_START - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
        const mins = Math.floor(diff / (1000 * 60)) % 60;
        const secs = Math.floor(diff / 1000) % 60;
        statusEl.textContent = `距離行程開始還有...`;

        /*const totalSpan = TRIP_START - new Date('2025-01-01T00:00:00' + TZ_OFFSET); // 參考用：從年初到出發
        const elapsed = now - new Date('2025-01-01T00:00:00' + TZ_OFFSET);
        const pct = clamp((elapsed / totalSpan) * 100, 0, 100);
        progressBar.style.width = pct + '%';*/
    } else if (now <= TRIP_END) {
        // 旅程中：倒數到結束
        const diff = TRIP_END - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
        const mins = Math.floor(diff / (1000 * 60)) % 60;
        const secs = Math.floor(diff / 1000) % 60;
        statusEl.textContent = `正在旅程中！距離結束還有...`;
    } else {
        // 旅程結束
        statusEl.textContent = '旅程已結束，期待下次冒險！';
    }
}
tick();
setInterval(tick, 1000);

// === 行程載入（GAS 或離線範例）===
/*const itineraryEl = document.getElementById('itinerary');
const gasInput = document.getElementById('gasUrl');
const saveBtn = document.getElementById('saveGasUrl');

gasInput.value = localStorage.getItem('gasUrl') || '';
saveBtn.addEventListener('click', () => {
    const url = gasInput.value.trim();
    if (url) { localStorage.setItem('gasUrl', url); }
    loadItinerary();
});*/

async function loadItinerary() {
    const url = localStorage.getItem('gasUrl');
    let items = [];
    try {
        if (url) {
            const res = await fetch(url, { cache: 'no-store' });
            const data = await res.json();
            items = (data && data.items) ? data.items : [];
        }
    } catch (err) {
        console.warn('GAS 載入失敗，改用離線資料', err);
    }
    if (!items.length) { items = offlineSample(); }
    renderItinerary(items);
}

function offlineSample() {
    return [
        { date: '2025-12-25', time: '07:30', title: '出發日', location: '台北 → 東京', notes: 'NRT 入境，Suica 充值', link: '' },
        { date: '2025-12-26', time: '09:30', title: '越後湯澤車站', location: '越後湯澤', notes: 'JR 上越新幹線；午餐站內美食街', link: '' },
        { date: '2025-12-27', time: '08:30', title: '越後 GALA 滑雪場', location: 'GALA 湯沢', notes: '租裝備／初學課程，注意車班', link: 'https://gala.co.jp/' },
        { date: '2025-12-28', time: '10:00', title: '東京迪士尼', location: '舞濱', notes: '事先購票，下載 App 預約', link: 'https://www.tokyodisneyresort.jp/' },
        { date: '2025-12-29', time: '09:00', title: '淺草雷門', location: '淺草', notes: '拍照人潮多，早點到', link: '' },
        { date: '2025-12-29', time: '11:00', title: '仲見世商店街', location: '淺草', notes: '伴手禮散策、淺草寺', link: '' },
        { date: '2026-01-01', time: '', title: '返程', location: '東京 → 台北', notes: '預留機場時間', link: '' }
    ];
}

function groupByDate(items) {
    const map = new Map();
    for (const it of items) {
        const key = it.date || '未指定日期';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(it);
    }
    // 依日期排序（字串 yyyy-MM-dd 可直接排序）
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function renderItinerary(items) {
    const groups = groupByDate(items);
    itineraryEl.innerHTML = groups.map(([date, arr]) => {
        const cards = arr
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
            .map(it => card(it))
            .join('');
        const dateLabel = dateFmt(date);
        return `<article>
          <header style="margin:.5rem 0 1rem"><h3 style="margin:0">📅 ${dateLabel}</h3></header>
          <div class="grid">${cards}</div>
        </article>`;
    }).join('');
}

function card(it) {
    const link = it.link ? `<a href="${it.link}" target="_blank" rel="noopener">官方 / 參考連結</a>` : '';
    const time = it.time ? `<span class="chip" aria-label="時間"><strong>⏰ ${it.time}</strong></span>` : '';
    const loc = it.location ? `<span class="chip" aria-label="地點">📍 ${escapeHtml(it.location)}</span>` : '';
    return `<div class="card">
        <h4 style="margin:.25rem 0 .5rem">${escapeHtml(it.title || '未命名')}</h4>
        <div style="display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:.5rem">${time}${loc}</div>
        <p class="muted" style="min-height:2.5em">${escapeHtml(it.notes || '')}</p>
        ${link}
      </div>`;
}

function dateFmt(s) {
    if (!/\d{4}-\d{2}-\d{2}/.test(s)) return s;
    const [y, m, d] = s.split('-');
    return `${y}/${m}/${d}`;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"] /g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', ' ': '&nbsp;' }[s]));
}

// 初始載入
//loadItinerary();
document.addEventListener('DOMContentLoaded', () => {
    let flipdown = new FlipDown(Math.floor(TRIP_START.getTime() / 1000), "CDTimer", {
        headings: ["天", "時", "分", "秒"],
        theme: getSystemThemeReverse(),
    }).start();
});
function getSystemThemeReverse() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? "light"
        : "dark";
}

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function updateTheme(e) {
    const newTheme = e.matches ? "light" : "dark";
    let body = document.body;
    body.querySelector('#CDTimer').classList.toggle('flipdown__theme-dark');
    body.querySelector('#CDTimer').classList.toggle('flipdown__theme-light');
}

mediaQuery.addEventListener("change", updateTheme);

const modal = document.getElementById("myModal");
const openBtn = document.getElementById("flight-info");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => {
    modal.showModal(); // 顯示 modal
});

closeBtn.addEventListener("click", () => {
    modal.close(); // 關閉 modal
});