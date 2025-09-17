const LIFF_ID = "2007692538-9OdA5Yvm";                // 來自 LINE Developers
const GAS_URL = "https://script.google.com/macros/s/AKfycbx8CmYZgY915X3eGO84idsSB11dGa2vC7kA8qGeIYFFU3dgmFn1e9gd8Ffzgl92VzyJDg/exec";        // 你的 GAS Web App URL

const img = document.getElementById('accountImage');
const out = document.getElementById('accountOut');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');


async function init() {
    try {
        loginBtn.onclick = () => liff.login();
        await liff.init({ liffId: LIFF_ID });
        // 若未登入，顯示登入按鈕；已登入就直接處理
        if (!liff.isLoggedIn()) {
            loginBtn.style.display = 'block';
            out.textContent = '尚未登入，請點「使用 LINE 登入」';
        } else {
            await afterLogin();
        }
    } catch {
        liff.logout();
        loginBtn.style.display = 'block';
        out.textContent = '登入已過期，請點「使用 LINE 登入」以重新登入';
    }
}

async function afterLogin() {
    // 取得使用者資料
    const profile = await liff.getProfile();        // { userId, displayName, pictureUrl, statusMessage? }
    const idToken = liff.getIDToken();              // 用來給後端驗證 (需要 scope: openid)
    const decoded = liff.getDecodedIDToken?.();     // 可在前端查看 sub/email 等（僅參考）

    img.src = profile.pictureUrl;
    out.innerHTML = `<strong>${profile.displayName}</strong>`;
    console.log(profile);
    // 傳給 GAS 記錄
    // try {
    //     const res = await fetch(GAS_URL, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //         body: new URLSearchParams({
    //             idToken: liff.getIDToken(),
    //             profile: JSON.stringify(await liff.getProfile())
    //         })
    //     });

    //     const data = await res.json();
    //     if (!data.ok) {
    //         out.textContent += `\n登入失敗`;
    //     }
    // } catch (e) {
    //     out.textContent += `\n送出至 GAS 失敗：${e}`;
    // }
}

init();