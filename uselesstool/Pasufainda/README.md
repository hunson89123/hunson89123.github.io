# Pasufainda · 步行路線規劃

繁體中文、響應式、純靜態網頁。直接部署至 GitHub Pages，不需要 Node.js 建置或自己的後端。

## 使用

1. 到 [HeiGIT 帳號中心](https://account.heigit.org/) 申請 OpenRouteService API Key。
2. 開啟網頁的「路由服務設定」，貼上 Key。Key 僅存在分頁記憶體，重新整理後清除，未寫入 localStorage、網址或專案檔案。不要把私人 Key 寫入公開 GitHub 儲存庫。
3. 每行輸入 `緯度, 經度, 名稱（選填）`，例如：

   ```text
   25.03753, 121.49988, 龍山寺
   25.03674, 121.50285, 剝皮寮歷史街區
   25.04210, 121.50794, 西門紅樓
   25.04778, 121.51704, 台北車站
   ```

4. 可點擊地圖加入座標，或用清單的上下箭頭改變順序。
5. 選擇模式後按「規劃步行路線」。完成後可看分段距離、預估時間、逐步導航與下載 GPX。

### 兩種模式

- **依照輸入順序**：最多 50 點，使用 OpenRouteService `foot-walking` 的 `fastest` 偏好，依序走訪所有點。
- **最佳化中途順序**：最多 12 點，固定第一點與最後一點。透過步行時間矩陣與 Held–Karp 動態規劃，求出此矩陣下時間總和最小的順序，再取得該順序的實際路線。支援不對稱與不可達路段；所有組合都不可達時顯示錯誤。矩陣與最終導航估時可能略有差異。

這裡的「最佳」是服務所提供路網與預估時間下的結果，不包含即時施工、天氣、個人速度與停留時間。座標會吸附至附近可步行路網，請以現場可通行狀況為準。這不是離線導航 App。

## 部署至 GitHub Pages

1. 在 GitHub 建立儲存庫，例如 `pasufainda`。
2. 將本專案檔案放到儲存庫根目錄。至少包含：

   ```text
   index.html
   style.css
   app.js
   core.js
   .nojekyll
   vendor/
     leaflet.css
     leaflet.js
     LICENSE
     images/
   ```

3. 儲存庫 **Settings → Pages → Build and deployment**，Source 選 **Deploy from a branch**。
4. 選 `main` 分支、`/ (root)`，按 **Save**。
5. 等 GitHub 部署完成，開啟 `https://你的帳號.github.io/pasufainda/`。若使用既有儲存庫，改用實際的儲存庫名稱。

所有程式與樣式路徑都是相對路徑，支援 GitHub Pages 專案子目錄。也可以只解壓縮 `pasufainda-github-pages.zip` 的內容到儲存庫根目錄。不要只上傳 zip 本身。

## 本機預覽與檢查

使用 Python（無額外套件）：

```sh
python -m http.server 4173 --bind 127.0.0.1
```

開啟 `http://127.0.0.1:4173`。請使用 HTTP 伺服器，直接雙擊 `index.html` 的 `file://` 方式可能因 ES module 限制無法執行。

有 Node.js 18+ 時可執行 `npm test` 和 `npm run check`，不需要 npm install。測試涵蓋座標驗證、最佳化結果與暴力窮舉對照、不可達路線、GPX 編碼。

## 外部服務與隱私

- 路線直接由瀏覽器請求 `https://api.openrouteservice.org`；傳送座標及使用者輸入的 API Key。一般模式用 1 次 Directions 請求；最佳化在超過 2 點時另用 1 次 Matrix 請求。服務額度、CORS、可用性依供應商設定。
- 每位訪客輸入自己的 Key。本網站沒有內建共用 Key。若想讓所有訪客免填 Key，需要另外建置安全代理後端，純 GitHub Pages 無法保密共用憑證。
- OpenStreetMap 圖磚需要網路，地圖視野會決定向圖磚服務要求的區域；未預先下載或快取離線圖磚。
- Google Fonts 為可選字型，無法連線時使用本機字型。Leaflet 1.9.4 隨專案附帶，授權見 `vendor/LICENSE`。
- 不會儲存地點清單；重新整理會清除。可使用 GPX 保留已規劃路線。

官方參考：[Directions](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/)、[Matrix](https://giscience.github.io/openrouteservice/api-reference/endpoints/matrix/)、[服務限制](https://giscience.github.io/openrouteservice/hosted-api-restrictions)、[Leaflet](https://leafletjs.com/)、[OpenStreetMap 圖磚政策](https://operations.osmfoundation.org/policies/tiles/)。
