const map = L.map("map").setView([25.05717472524907, 121.36508365158228], 16);

L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
}).addTo(map);

const s2Layer = L.layerGroup().addTo(map);
const scanLayer = L.layerGroup().addTo(map);
const s2Cells = new Map();
let scannedS2Keys = new Set();

const poiLayer = L.layerGroup().addTo(map);
const poiCircles = [];
let currentNearbyPois = [];
let currentNearbyClickedLatLng = null;
let nearbySwalIsOpen = false;

let abortController = null;
let debounceTimer = null;
let lastFetchTime = 0;
let selectedS2Key = null;
let selectedS2Layer = null;

let pikminDecorRules = [];

const SCAN_RADIUS_METERS = 100;

const S2_NORMAL_STYLE = {
    color: "#2563eb",
    weight: 1,
    opacity: 0.2,
    fillColor: "#60a5fa",
    fillOpacity: 0.01,
    interactive: true
};

const S2_SELECTED_STYLE = {
    color: "#f97316",
    weight: 3,
    opacity: 0.95,
    fillColor: "#fb923c",
    fillOpacity: 0.25,
    interactive: true
};

const S2_SCANNED_STYLE = {
    color: "#16a34a",
    weight: 3,
    opacity: 0.95,
    fillColor: "#86efac",
    fillOpacity: 0.28,
    interactive: true
};

const SCAN_CIRCLE_STYLE = {
    radius: SCAN_RADIUS_METERS,
    color: "#dc2626",
    weight: 2,
    opacity: 0.9,
    fillColor: "#fca5a5",
    fillOpacity: 0.18,
    interactive: false
};

const POI_POLYGON_STYLE = {
    color: "#7c3aed",
    weight: 2,
    opacity: 0.9,
    fillColor: "#c4b5fd",
    fillOpacity: 0.35
};

const POI_LINE_STYLE = {
    color: "#7c3aed",
    weight: 3,
    opacity: 0.9
};

const MOCK_POIS_ENABLED = false;

const MOCK_POIS = [
    {
        type: "node",
        id: "mock-restaurant-001",
        lat: 25.05717472524907,
        lon: 121.36508365158228,
        tags: {
            name: "測試餐廳",
            amenity: "restaurant"
        }
    },
    {
        type: "node",
        id: "mock-convenience-001",
        lat: 25.05745,
        lon: 121.36535,
        tags: {
            name: "測試便利商店",
            shop: "convenience"
        }
    },
    {
        type: "way",
        id: "mock-park-001",
        tags: {
            name: "測試公園範圍",
            leisure: "park"
        },
        geometry: [
            { lat: 25.05695, lon: 121.36485 },
            { lat: 25.05695, lon: 121.36525 },
            { lat: 25.05735, lon: 121.36525 },
            { lat: 25.05735, lon: 121.36485 },
            { lat: 25.05695, lon: 121.36485 }
        ]
    }
];

async function loadDecorRules() {
    const res = await fetch("./decor.json");

    if (!res.ok) {
        throw new Error(`讀取 decor.json 失敗：HTTP ${res.status}`);
    }

    pikminDecorRules = await res.json();
}

function escapeOverpassRegexValue(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTagFilter(key, values) {
    const escapedValues = values.map(escapeOverpassRegexValue);
    const regex = `^(${escapedValues.join("|")})$`;

    return `["${key}"~"${regex}"]`;
}

function buildOverpassQuery(bounds, decorRules) {
    const s = bounds.getSouth();
    const w = bounds.getWest();
    const n = bounds.getNorth();
    const e = bounds.getEast();

    const bbox = `(${s},${w},${n},${e})`;

    const queryParts = [];

    decorRules.forEach(rule => {
        Object.entries(rule.match).forEach(([key, values]) => {
            const tagFilter = buildTagFilter(key, values);

            queryParts.push(`node${tagFilter}${bbox};`);
            queryParts.push(`way${tagFilter}${bbox};`);
            queryParts.push(`relation${tagFilter}${bbox};`);
        });
    });

    return `
[out:json][timeout:25];
(
  ${queryParts.join("\n  ")}
);
out geom;
`;
}

function getLatLng(el) {
    if (typeof el.lat === "number" && typeof el.lon === "number") {
        return [el.lat, el.lon];
    }

    if (el.center && typeof el.center.lat === "number" && typeof el.center.lon === "number") {
        return [el.center.lat, el.center.lon];
    }

    return null;
}

function getElementGeometryLatLngs(el) {
    if (!Array.isArray(el.geometry) || el.geometry.length < 2) {
        return null;
    }

    const latlngs = el.geometry
        .filter((point) => typeof point.lat === "number" && typeof point.lon === "number")
        .map((point) => [point.lat, point.lon]);

    return latlngs.length >= 2 ? latlngs : null;
}

function isClosedGeometry(latlngs) {
    if (!latlngs || latlngs.length < 4) return false;

    const first = latlngs[0];
    const last = latlngs[latlngs.length - 1];

    return first[0] === last[0] && first[1] === last[1];
}

function closePolygonIfNeeded(latlngs) {
    if (!latlngs || latlngs.length === 0) return latlngs;

    const first = latlngs[0];
    const last = latlngs[latlngs.length - 1];

    if (first[0] === last[0] && first[1] === last[1]) {
        return latlngs;
    }

    return [...latlngs, first];
}

function getLabel(el) {
    const tags = el.tags || {};

    return (
        tags.name ||
        tags.brand ||
        tags.amenity ||
        tags.shop ||
        tags.tourism ||
        tags.leisure ||
        tags.natural ||
        tags.landuse ||
        tags.railway ||
        tags.highway ||
        `${el.type}/${el.id}`
    );
}

function getPoiLayer(el, label, decor) {
    const latlng = getLatLng(el);
    const geometryLatLngs = getElementGeometryLatLngs(el);

    const popupHtml = `<b>${escapeHtml(decor.label)}</b>`;

    if ((el.type === "way" || el.type === "relation") && geometryLatLngs) {
        const layer = isClosedGeometry(geometryLatLngs)
            ? L.polygon(geometryLatLngs, POI_POLYGON_STYLE)
            : L.polyline(geometryLatLngs, POI_LINE_STYLE);

        layer.bindPopup(popupHtml);
        return layer;
    }

    if (latlng) {
        return L.marker(latlng).bindPopup(popupHtml);
    }

    return null;
}

function getPoiGeometry(el) {
    const latlng = getLatLng(el);
    const geometryLatLngs = getElementGeometryLatLngs(el);

    if ((el.type === "way" || el.type === "relation") && geometryLatLngs) {
        if (isClosedGeometry(geometryLatLngs)) {
            return {
                type: "polygon",
                polygon: closePolygonIfNeeded(geometryLatLngs),
                latlng: L.latLngBounds(geometryLatLngs).getCenter()
            };
        }

        return {
            type: "line",
            line: geometryLatLngs,
            latlng: L.latLngBounds(geometryLatLngs).getCenter()
        };
    }

    if (latlng) {
        return {
            type: "point",
            point: latlng,
            latlng: L.latLng(latlng[0], latlng[1])
        };
    }

    return null;
}



function tagValueIncludes(tagValue, expectedValues) {
    if (!tagValue) return false;

    const values = String(tagValue)
        .split(";")
        .map((value) => value.trim());

    return expectedValues.some((expectedValue) => values.includes(expectedValue));
}

function getPikminDecor(el) {
    const tags = el.tags || {};

    const matchedDecor = pikminDecorRules.find((rule) => {
        return Object.entries(rule.match).some(([tagKey, expectedValues]) => {
            return tagValueIncludes(tags[tagKey], expectedValues);
        });
    });

    return matchedDecor || {
        label: "未知飾品",
        emoji: "❓"
    };
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getPoiTypeLabel(poi) {
    if (poi.geometryType === "polygon") return "範圍";
    if (poi.geometryType === "line") return "線段";
    return "點";
}

function groupPoisByDecor(pois) {
    const decorMap = new Map();

    for (const poi of pois) {
        const decorKey = poi.decorLabel || "未知飾品";

        if (!decorMap.has(decorKey)) {
            decorMap.set(decorKey, {
                decorLabel: poi.decorLabel || "未知飾品",
                decorIcon: poi.decorIcon,
                decorList: poi.decorList,
                pois: []
            });
        }

        decorMap.get(decorKey).pois.push(poi);
    }

    return [...decorMap.values()]
        .map((group) => ({
            ...group,
            pois: group.pois.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"))
        }))
        .sort((a, b) => a.decorLabel.localeCompare(b.decorLabel, "zh-Hant"));
}

function buildNearbyPoiListHtml(pois) {
    if ((!pois || pois.length === 0) && poiCircles.length === 0) {
        return `
            <div style="text-align:center;">
                <p>目前無地點資訊，請先按「<i class="fa-solid fa-satellite-dish"></i>」掃描附近地點</p>
            </div>
        `;
    }

    const safePois = Array.isArray(pois) ? [...pois] : [];
    const decorGroups = groupPoisByDecor(safePois);

    return `
    <div style="text-align:center;">
        <div style="text-align:center; margin-bottom:10px;">
            共找到 <b>${safePois.length}</b> 個地點，
            對應 <b>${decorGroups.length}</b> 種飾品
        </div>

        <ul style="
            list-style:none;
            padding:0;
            margin:0;
            display:flex;
            flex-wrap:wrap;
            gap:8px;
            justify-content:center;
            align-items:flex-start;
        ">
            ${decorGroups.map((group) => `
                <li style="
                    border:1px solid #ddd;
                    border-radius:9999px;
                    padding:10px 12px;
                    background:#fff;
                    text-wrap:nowrap;
                ">
                    <div style="
                        display:flex;
                        align-items:center;
                        gap:6px;
                    ">
                        <span style="
                            width:20px;
                            height:20px;
                            display:inline-block;
                            background-color:#545454;
                            mask-image:url('decor_icon/${escapeHtml(group.decorIcon)}.png');
                            mask-size:contain;
                            mask-repeat:no-repeat;
                            mask-position:center;
                            -webkit-mask-image:url('decor_icon/${escapeHtml(group.decorIcon)}.png');
                            -webkit-mask-size:contain;
                            -webkit-mask-repeat:no-repeat;
                            -webkit-mask-position:center;
                            flex-shrink:0;
                        "></span>
                        |
                        <b>
                            ${escapeHtml(group.decorList)}
                        </b>
                    </div>
                </li>
            `).join("")}
        </ul>
    </div>
`;
}

function updateNearbyLocationDialog() {
    if (!nearbySwalIsOpen || !Swal.isVisible()) return;

    Swal.update({
        html: buildNearbyPoiListHtml(currentNearbyPois)
    });
}

function openNearbyLocationDialog() {
    nearbySwalIsOpen = true;

    Swal.fire({
        // iconHtml: `<i class="fa-solid fa-map-location-dot"></i>`,
        // customClass: {
        //     icon: "swal-radar-icon"
        // },
        // title: '附近地點',
        html: buildNearbyPoiListHtml(currentNearbyPois),
        position: "top",
        backdrop: false,
        width: "auto",
        confirmButtonText: "關閉",
        didClose: () => {
            nearbySwalIsOpen = false;
        }
    });
}

/* =========================
   幾何判斷：S2 Cell vs POI
   ========================= */

function toXY(point) {
    return {
        x: point[1],
        y: point[0]
    };
}

function pointInPolygon(point, polygon) {
    const p = toXY(point);
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const pi = toXY(polygon[i]);
        const pj = toXY(polygon[j]);

        const intersects =
            ((pi.y > p.y) !== (pj.y > p.y)) &&
            (p.x < ((pj.x - pi.x) * (p.y - pi.y)) / (pj.y - pi.y) + pi.x);

        if (intersects) {
            inside = !inside;
        }
    }

    return inside;
}

function orientation(a, b, c) {
    const pa = toXY(a);
    const pb = toXY(b);
    const pc = toXY(c);

    const value =
        (pb.y - pa.y) * (pc.x - pb.x) -
        (pb.x - pa.x) * (pc.y - pb.y);

    if (Math.abs(value) < 1e-12) return 0;

    return value > 0 ? 1 : 2;
}

function onSegment(a, b, c) {
    const pa = toXY(a);
    const pb = toXY(b);
    const pc = toXY(c);

    return (
        pb.x <= Math.max(pa.x, pc.x) &&
        pb.x >= Math.min(pa.x, pc.x) &&
        pb.y <= Math.max(pa.y, pc.y) &&
        pb.y >= Math.min(pa.y, pc.y)
    );
}

function segmentsIntersect(p1, q1, p2, q2) {
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (o1 !== o2 && o3 !== o4) return true;

    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false;
}

function polygonEdgesIntersect(polyA, polyB) {
    for (let i = 0; i < polyA.length - 1; i++) {
        const a1 = polyA[i];
        const a2 = polyA[i + 1];

        for (let j = 0; j < polyB.length - 1; j++) {
            const b1 = polyB[j];
            const b2 = polyB[j + 1];

            if (segmentsIntersect(a1, a2, b1, b2)) {
                return true;
            }
        }
    }

    return false;
}

function polygonsOverlap(polyA, polyB) {
    if (!polyA || !polyB || polyA.length < 4 || polyB.length < 4) {
        return false;
    }

    const closedA = closePolygonIfNeeded(polyA);
    const closedB = closePolygonIfNeeded(polyB);

    if (polygonEdgesIntersect(closedA, closedB)) {
        return true;
    }

    if (pointInPolygon(closedA[0], closedB)) {
        return true;
    }

    if (pointInPolygon(closedB[0], closedA)) {
        return true;
    }

    return false;
}

function lineIntersectsPolygon(line, polygon) {
    if (!line || line.length < 2 || !polygon || polygon.length < 4) {
        return false;
    }

    const closedPolygon = closePolygonIfNeeded(polygon);

    for (let i = 0; i < line.length - 1; i++) {
        const lineA = line[i];
        const lineB = line[i + 1];

        for (let j = 0; j < closedPolygon.length - 1; j++) {
            const polygonA = closedPolygon[j];
            const polygonB = closedPolygon[j + 1];

            if (segmentsIntersect(lineA, lineB, polygonA, polygonB)) {
                return true;
            }
        }
    }

    return line.some((point) => pointInPolygon(point, closedPolygon));
}

function poiIntersectsS2Cell(poi, s2CellPolygon) {
    if (poi.geometryType === "point") {
        return pointInPolygon(poi.point, s2CellPolygon);
    }

    if (poi.geometryType === "polygon") {
        return polygonsOverlap(poi.polygon, s2CellPolygon);
    }

    if (poi.geometryType === "line") {
        return lineIntersectsPolygon(poi.line, s2CellPolygon);
    }

    return false;
}

/* =========================
   S2
   ========================= */

const S2_LEVEL = 17;
const S2_SCAN_STEP_METERS = 60;

function metersToLatDegrees(meters) {
    return meters / 111320;
}

function metersToLngDegrees(meters, lat) {
    return meters / (111320 * Math.cos(lat * Math.PI / 180));
}

function getS2KeyFromLatLng(lat, lng, level) {
    const cell = S2.S2Cell.FromLatLng({ lat, lng }, level);
    return cell.toHilbertQuadkey();
}

function getS2PolygonFromKey(key) {
    const cell = S2.S2Cell.FromHilbertQuadKey(key);
    const corners = cell.getCornerLatLngs();

    const latlngs = corners.map((corner) => [
        corner.lat,
        corner.lng
    ]);

    return closePolygonIfNeeded(latlngs);
}

function resetS2CellStyles() {
    s2Cells.forEach((cellInfo, key) => {
        cellInfo.layer.setStyle(key === selectedS2Key ? S2_SELECTED_STYLE : S2_NORMAL_STYLE);
    });
}

function getS2CenterFromPolygon(polygonLatLngs) {
    const corners = polygonLatLngs.slice(0, 4);

    const avgLat =
        corners.reduce((sum, point) => sum + point[0], 0) / corners.length;

    const avgLng =
        corners.reduce((sum, point) => sum + point[1], 0) / corners.length;

    return L.latLng(avgLat, avgLng);
}

function getPoisInS2Keys(s2Keys) {
    return poiCircles
        .filter((poi) => {
            for (const s2Key of s2Keys) {
                const cellInfo = s2Cells.get(s2Key);
                if (!cellInfo) continue;

                if (poiIntersectsS2Cell(poi, cellInfo.polygon)) {
                    return true;
                }
            }

            return false;
        })
        .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
}

function getPoisInS2Cell(s2Key) {
    const cellInfo = s2Cells.get(s2Key);
    if (!cellInfo) return [];

    return poiCircles
        .filter((poi) => poiIntersectsS2Cell(poi, cellInfo.polygon))
        .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
}

function scanS2CellsByPoint(clicked) {
    selectedS2Key = null;
    selectedS2Layer = null;

    scanLayer.clearLayers();
    L.circle(clicked, SCAN_CIRCLE_STYLE).addTo(scanLayer);

    resetS2CellStyles();

    scannedS2Keys = new Set();

    s2Cells.forEach((cellInfo, key) => {
        const distanceToCenter = clicked.distanceTo(cellInfo.center);

        if (distanceToCenter <= SCAN_RADIUS_METERS) {
            scannedS2Keys.add(key);
            cellInfo.layer.setStyle(S2_SCANNED_STYLE);
            cellInfo.layer.bringToFront();
        }
    });

    const matchedPois = getPoisInS2Keys(scannedS2Keys);

    currentNearbyClickedLatLng = clicked;
    currentNearbyPois = matchedPois;

    updateNearbyLocationDialog();
}

function selectS2Cell(s2Key, polygonLatLngs, layer) {
    if (selectedS2Layer && selectedS2Layer !== layer) {
        selectedS2Layer.setStyle(S2_NORMAL_STYLE);
    }

    selectedS2Key = s2Key;
    selectedS2Layer = layer;

    layer.setStyle(S2_SELECTED_STYLE);
    layer.bringToFront();

    const poisInCell = getPoisInS2Cell(s2Key);

    const content = poisInCell.length === 0
        ? `
            <b>S2 Cell</b><br>
            <code>${escapeHtml(s2Key)}</code><br>
            此區域目前沒有已搜尋到的地點。
        `
        : `
            <b>S2 Cell 內的地點：${poisInCell.length} 個</b><br>
            <code>${escapeHtml(s2Key)}</code>
            <ul class="s2-popup-list">
                ${poisInCell.map((poi) => {
            const typeLabel =
                poi.geometryType === "polygon"
                    ? "範圍"
                    : poi.geometryType === "line"
                        ? "線段"
                        : "點";

            return `<li>${escapeHtml(poi.name)} <small>(${typeLabel})</small></li>`;
        }).join("")}
            </ul>
        `;

    const popupLatLng = L.latLngBounds(polygonLatLngs).getCenter();

    L.popup()
        .setLatLng(popupLatLng)
        .setContent(content)
        .openOn(map);
}

function drawS2Cells() {
    s2Layer.clearLayers();
    s2Cells.clear();

    if (map.getZoom() < 15) {
        return;
    }

    const bounds = map.getBounds();

    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    const centerLat = bounds.getCenter().lat;

    const latStep = metersToLatDegrees(S2_SCAN_STEP_METERS);
    const lngStep = metersToLngDegrees(S2_SCAN_STEP_METERS, centerLat);

    const keys = new Set();

    for (let lat = south - latStep; lat <= north + latStep; lat += latStep) {
        for (let lng = west - lngStep; lng <= east + lngStep; lng += lngStep) {
            const key = getS2KeyFromLatLng(lat, lng, S2_LEVEL);
            keys.add(key);
        }
    }

    selectedS2Layer = null;

    for (const key of keys) {
        const polygon = getS2PolygonFromKey(key);

        const style = scannedS2Keys.has(key)
            ? S2_SCANNED_STYLE
            : key === selectedS2Key
                ? S2_SELECTED_STYLE
                : S2_NORMAL_STYLE;

        const layer = L.polygon(polygon, style).addTo(s2Layer);
        const center = getS2CenterFromPolygon(polygon);

        s2Cells.set(key, {
            key,
            polygon,
            center,
            layer
        });

        if (scannedS2Keys.has(key) || key === selectedS2Key) {
            if (key === selectedS2Key) {
                selectedS2Layer = layer;
            }

            layer.bringToFront();
        }

        layer.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            scanS2CellsByPoint(e.latlng);
        });
    }

    if (scannedS2Keys.size > 0) {
        currentNearbyPois = getPoisInS2Keys(scannedS2Keys);
        updateNearbyLocationDialog();
    }
}

function scheduleRefresh() {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        drawS2Cells();
    }, 700);
}

/* =========================
   搜尋 POI
   ========================= */

function setSearchLoading(isLoading, message = "") {
    $("#searchNearbyBtn").prop("disabled", isLoading);

    if (isLoading) {
        $("body").loadingModal({
            text: "搜尋附近地點中...",
            animation: "cubeGrid",
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            color: "#ffffff",
            opacity: "0.7"
        });
    } else {
        $("body").loadingModal("destroy");
    }
}

async function refreshPOIs() {
    if (map.getZoom() < 15) {
        poiLayer.clearLayers();
        poiCircles.length = 0;
        Swal.fire({
            icon: "info",
            title: "無法探測",
            text: "請放大到15級以上再搜尋",
            confirmButtonText: "好吧😐"
        });
        return;
    }

    const now = Date.now();

    if (now - lastFetchTime < 30000) {
        Swal.fire({
            icon: "error",
            title: "探測失敗",
            text: "搜尋太頻繁，請稍後再試",
            confirmButtonText: "好吧😐"
        });
        return;
    }

    lastFetchTime = now;

    if (abortController) {
        abortController.abort();
    }

    abortController = new AbortController();

    const query = buildOverpassQuery(map.getBounds(), pikminDecorRules);

    setSearchLoading(true, "搜尋中...");

    try {
        let data = [];
        if (!MOCK_POIS_ENABLED) {

            const res = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: query,
                signal: abortController.signal
            });

            if (res.status === 429 || res.status === 504) {
                $("body").loadingModal("destroy");

                Swal.fire({
                    icon: "error",
                    title: "探測失敗",
                    text: "呼叫API次數過於頻繁，請於1分鐘後再試",
                    confirmButtonText: "我等😐"
                });

                console.warn("呼叫API次數過於頻繁，請於1分鐘後再試");
                setSearchLoading(false, "呼叫API次數過於頻繁，請於1分鐘後再試");
                return;
            }

            if (!res.ok) {
                $("body").loadingModal("destroy");

                Swal.fire({
                    icon: "error",
                    title: "探測錯誤",
                    text: `呼叫API時發生錯誤：${res.status}`,
                    confirmButtonText: "噢不😲"
                });

                throw new Error(`HTTP ${res.status}`);
            }
            data = await res.json();
        }

        poiLayer.clearLayers();
        poiCircles.length = 0;

        const seen = new Set();

        const elements = MOCK_POIS_ENABLED
            ? [...(data.elements || []), ...MOCK_POIS]
            : data.elements || [];

        for (const el of elements) {
            const key = `${el.type}-${el.id}`;

            if (seen.has(key)) continue;
            seen.add(key);

            const label = getLabel(el);
            const decor = getPikminDecor(el);
            const poiDisplayLayer = getPoiLayer(el, label, decor);
            if (!poiDisplayLayer) continue;

            const poiGeometry = getPoiGeometry(el);
            if (!poiGeometry) continue;

            poiDisplayLayer.addTo(poiLayer);

            poiCircles.push({
                id: key,
                name: label,
                decorLabel: decor.label,
                decorIcon: decor.icon,
                decorList: decor.decor.join(", "),
                latlng: poiGeometry.latlng,

                geometryType: poiGeometry.type,
                point: poiGeometry.point || null,
                polygon: poiGeometry.polygon || null,
                line: poiGeometry.line || null,

                layer: poiDisplayLayer,
                osmType: el.type,
                osmId: el.id
            });
        }
        if (scannedS2Keys.size > 0) {
            resetS2CellStyles();

            scannedS2Keys.forEach((key) => {
                const cellInfo = s2Cells.get(key);

                if (cellInfo) {
                    cellInfo.layer.setStyle(S2_SCANNED_STYLE);
                    cellInfo.layer.bringToFront();
                }
            });

            currentNearbyPois = getPoisInS2Keys(scannedS2Keys);
            updateNearbyLocationDialog();
        }

        setSearchLoading(false, `已完成搜尋，共 ${poiCircles.length} 個地點`);
    } catch (err) {
        if (err.name !== "AbortError") {
            console.error(err);
            setSearchLoading(false, "搜尋失敗，請查看 console");
        }
    } finally {
        if (!abortController?.signal.aborted) {
            $("#searchNearbyBtn").prop("disabled", false);
            $("body").loadingModal("destroy");
        }
    }
}

/* =========================
   Event listeners
   ========================= */

map.on("click", (e) => {
    scanS2CellsByPoint(e.latlng);
});

$("#searchNearbyBtn").on("click", () => {
    refreshPOIs();
});

$("#nearbyLocationBtn").on("click", () => {
    openNearbyLocationDialog();
});

async function init() {
    try {
        await loadDecorRules();
    } catch (err) {
        console.error(err);

        Swal.fire({
            icon: "error",
            title: "飾品資料載入失敗",
            text: "無法讀取 decor.json，將無法顯示皮克敏飾品對應。",
            confirmButtonText: "知道了"
        });
    }

    drawS2Cells();

    map.on("moveend zoomend", scheduleRefresh);
}

init();

/* =========================
   使用者定位
   ========================= */

let userMarker = null;
let userAccuracyCircle = null;
let lastUserLatLng = null;
let isFollowingUser = false;

function updateMyLocationButton() {
    $("#myLocation").toggleClass("is-following", isFollowingUser);
}

function focusUserLocation(latlng) {
    if (isFollowingUser) {
        map.setView(latlng, Math.max(map.getZoom(), 17), {
            animate: true
        });

        scanS2CellsByPoint(latlng);
    }
}

map.locate({
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 10000
});

map.on("locationfound", (e) => {
    const latlng = e.latlng;
    const accuracy = e.accuracy;

    lastUserLatLng = latlng;

    if (!userMarker) {
        userMarker = L.marker(latlng)
            .addTo(map)
            .bindPopup("你目前的位置");
    } else {
        userMarker.setLatLng(latlng);
    }

    if (!userAccuracyCircle) {
        userAccuracyCircle = L.circle(latlng, {
            radius: accuracy,
            weight: 1,
            fillOpacity: 0.12
        }).addTo(map);
    } else {
        userAccuracyCircle.setLatLng(latlng);
        userAccuracyCircle.setRadius(accuracy);
    }

    if (isFollowingUser) {
        map.panTo(latlng, {
            animate: true
        });

        scanS2CellsByPoint(latlng);
    }
});

$("#myLocation").on("click", () => {
    isFollowingUser = true;
    updateMyLocationButton();

    if (lastUserLatLng) {
        focusUserLocation(lastUserLatLng);
        return;
    }

    map.locate({
        setView: false,
        watch: false,
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
    });
});

map.on("dragstart", () => {
    isFollowingUser = false;
    updateMyLocationButton();
});

map.on("locationerror", (e) => {
    console.warn(e.message);
    isFollowingUser = false;
    updateMyLocationButton();
});