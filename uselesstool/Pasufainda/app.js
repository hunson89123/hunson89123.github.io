import {parseCoordinates, optimalOrder, makeGpx} from './core.js';
const $ = id => document.getElementById(id);
let map, markers, routeLayer, result, controller, revision = 0, tileErrorShown = false;
const input = $('coordinates');
function status(message, type = '') {$('status').textContent = message; $('status').className = `status ${type}`;}
function selectedMode() {return document.querySelector('input[name="mode"]:checked').value;}
function resetResult() {
  revision++; controller?.abort(); controller = null;
  $('plan').disabled = false; $('plan').innerHTML = '規劃步行路線 <span aria-hidden="true">→</span>';
  result = null; routeLayer?.clearLayers(); $('route-details').hidden = true; $('export').disabled = true;
  $('distance').innerHTML = '—<small> km</small>'; $('duration').innerHTML = '—<small> 分鐘</small>'; $('stops').innerHTML = '—<small> 個地點</small>';
}
function drawMarkers(points) {
  if (!map) return;
  markers.clearLayers();
  points.forEach((point,index) => {
    const icon = L.divIcon({className:'', html:`<div class="stop-marker ${index===points.length-1 && index>0?'end':''}">${index+1}</div>`,iconSize:[28,28],iconAnchor:[14,14]});
    const text = document.createElement('span'); text.textContent = `${index+1}. ${point.name}`;
    L.marker([point.lat,point.lng],{icon}).bindPopup(text).addTo(markers);
  });
}
function fit() {
  if (!map) return;
  const bounds = L.featureGroup([markers,routeLayer]).getBounds();
  if (bounds.isValid()) map.fitBounds(bounds,{padding:[48,65],maxZoom:16});
}
function serialize(points) {input.value = points.map(p=>`${p.lat}, ${p.lng}, ${p.name}`).join('\n'); update();}
function update() {
  resetResult(); $('points').replaceChildren();
  try {
    const points = parseCoordinates(input.value);
    $('point-count').textContent = `${points.length} 個地點`;
    $('map-hint').hidden = points.length > 0;
    points.forEach((p,i) => {
      const row=document.createElement('div');row.className='point';
      const num=document.createElement('span');num.className='point-number';num.textContent=i+1;
      const content=document.createElement('div');content.className='point-text';content.textContent=p.name;
      const sub=document.createElement('small');sub.textContent=`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}${i===0?' · 起點':i===points.length-1?' · 終點':''}`;content.append(sub);
      row.append(num,content);
      [['↑',-1,'上移'],['↓',1,'下移'],['×',0,'刪除']].forEach(([symbol,delta,label])=>{
        const button=document.createElement('button');button.textContent=symbol;button.setAttribute('aria-label',`${label}${p.name}`);
        button.disabled = delta!==0 && (i+delta<0 || i+delta>=points.length);
        button.onclick=()=>{if(delta===0) points.splice(i,1);else [points[i],points[i+delta]]=[points[i+delta],points[i]];serialize(points);};row.append(button);
      });
      $('points').append(row);
    });
    drawMarkers(points);
    status(points.length ? '地點已更新，按「規劃步行路線」取得最新結果。' : '從兩個地點開始，規劃一段新的散步。');
  } catch(error) {$('point-count').textContent='請檢查座標';markers?.clearLayers();status(error.message,'error');}
}
async function request(path, body, signal) {
  const response = await fetch(`https://api.openrouteservice.org/v2/${path}`,{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':$('api-key').value.trim()},body:JSON.stringify(body),signal
  });
  if(!response.ok) {
    const messages={400:'路由服務無法處理這些座標，請確認地點靠近可步行道路。',401:'API Key 無效，請檢查連線設定。',403:'API Key 無效、無存取權限或額度已用完。',404:'找不到可用的步行路線，請調整地點。',429:'請求過於頻繁或已達服務額度，請稍後再試。',500:'路由服務暫時發生錯誤，請稍後再試。',503:'路由服務暫時無法使用，請稍後再試。'};
    throw new Error(messages[response.status] || `路由服務回應錯誤（${response.status}），請稍後再試。`);
  }
  return response.json();
}
function time(seconds) {const minutes=Math.max(1,Math.round(seconds/60));return minutes>=60?`${Math.floor(minutes/60)} 小時 ${minutes%60} 分`:`${minutes} 分鐘`;}
function distance(meters) {return meters>=1000?`${(meters/1000).toFixed(2)} km`:`${Math.round(meters)} m`;}
async function plan() {
  resetResult();const version=revision;let timeout, timedOut=false;
  try {
    const mode=selectedMode(), points=parseCoordinates(input.value,mode==='optimized'?12:50);
    if(points.length<2) throw new Error('請至少輸入起點與終點兩個座標。');
    if(!$('api-key').value.trim()) {$('settings').open=true;$('api-key').focus();throw new Error('請先在「路由服務設定」貼上 OpenRouteService API Key。');}
    const activeController = new AbortController();controller=activeController;
    timeout=setTimeout(()=>{timedOut=true;activeController.abort();},60000);
    $('plan').disabled=true;$('plan').textContent='正在規劃中…';
    let order=points.map((_,i)=>i), baseline=null, optimized=null;
    const locations=points.map(p=>[p.lng,p.lat]);
    if(mode==='optimized' && points.length>2) {
      status('正在比較各地點間的步行時間，尋找最佳順序…');
      const matrix=await request('matrix/foot-walking',{locations,metrics:['duration']},activeController.signal);
      order=optimalOrder(matrix.durations);
      const total = indexes => indexes.slice(1).reduce((sum,p,i)=>{const value=matrix.durations[indexes[i]][p];return sum+(typeof value==='number'&&Number.isFinite(value)?value:Infinity);},0);
      baseline=total(points.map((_,i)=>i));optimized=total(order);
    }
    status('正在取得沿街道的實際步行路線…');
    const route=await request('directions/foot-walking/geojson',{coordinates:order.map(i=>locations[i]),preference:'fastest',instructions:true,language:'zh',units:'m'},activeController.signal);
    if(version!==revision) return;
    const feature=route.features?.[0], summary=feature?.properties?.summary;
    if(feature?.geometry?.type!=='LineString'||!feature.geometry.coordinates?.length || !Number.isFinite(summary?.distance)||!Number.isFinite(summary?.duration)) throw new Error('路由服務未傳回完整路線，請稍後再試。');
    const ordered=order.map(i=>points[i]);result={feature,points:ordered};
    drawMarkers(ordered);
    if(map) {L.geoJSON(feature,{style:{color:'#ffffff',weight:9,opacity:.95}}).addTo(routeLayer);L.geoJSON(feature,{style:{color:'#22634c',weight:5,opacity:1}}).addTo(routeLayer);fit();}
    $('distance').innerHTML=`${(summary.distance/1000).toFixed(2)}<small> km</small>`;
    $('duration').textContent=time(summary.duration);
    $('duration').style.fontSize='23px';
    $('stops').innerHTML=`${points.length}<small> 個地點</small>`;
    $('route-mode').textContent=mode==='optimized'?'中途順序最佳化':'依照輸入順序';
    $('route-order').textContent=ordered.map((p,i)=>`${i+1}. ${p.name}`).join(' → ');
    let notice=mode==='optimized'?'依步行時間矩陣求得固定起終點的最佳中途順序；最終導航時間可能因路由處理略有差異。':'保留輸入順序，各段使用服務提供的最快步行路線。';
    if(Number.isFinite(baseline)&&optimized!==null) notice+=` 相較原順序，矩陣預估節省 ${Math.max(0,Math.round((baseline-optimized)/60))} 分鐘。`;
    notice+=' 座標會對齊附近路網；請留意現場通行狀況，預估時間不含停留。';
    if(feature.properties.warnings?.length) notice+=' 路由服務提醒：'+feature.properties.warnings.map(w=>w.message||'部分路段可能有限制').join('；');
    $('route-notice').textContent=notice;
    $('segments').replaceChildren();$('directions').replaceChildren();
    (feature.properties.segments||[]).forEach((segment,i)=>{
      const li=document.createElement('li');li.textContent=`${ordered[i]?.name||'地點'} → ${ordered[i+1]?.name||'地點'} · ${distance(segment.distance)} · ${time(segment.duration)}`;$('segments').append(li);
      (segment.steps||[]).forEach(step=>{const item=document.createElement('li');item.textContent=`${step.instruction} · ${distance(step.distance)}`;$('directions').append(item);});
    });
    $('route-details').hidden=false;$('export').disabled=false;
    status('路線已完成。準備好了，就出發吧！','success');
  } catch(error) {
    if(version!==revision) return;
    if(error.name==='AbortError') status(timedOut?'連線逾時，請稍後再試。':'規劃已取消。','error');
    else status(error instanceof TypeError?'無法連線至路由服務。請檢查網路，或稍後重試。':error.message,'error');
  } finally {
    clearTimeout(timeout);
    if(version===revision) {controller=null;$('plan').disabled=false;$('plan').innerHTML='規劃步行路線 <span aria-hidden="true">→</span>';}
  }
}
if(window.L) {
  map=L.map('map',{zoomControl:false}).setView([25.036,121.558],14);
  L.control.zoom({position:'topright'}).addTo(map);
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  tiles.on('tileerror',()=>{if(!tileErrorShown){tileErrorShown=true;$('map-hint').hidden=false;$('map-hint').textContent='地圖圖磚載入失敗，請檢查網路後重新整理。';}});
  markers=L.featureGroup().addTo(map);routeLayer=L.featureGroup().addTo(map);
  map.on('click',event=>{try{const points=parseCoordinates(input.value);if(points.length>=50) throw new Error('最多支援 50 個地點。');points.push({lat:Number(event.latlng.lat.toFixed(6)),lng:Number(event.latlng.wrap().lng.toFixed(6)),name:`地點 ${points.length+1}`});serialize(points);}catch(error){status(error.message,'error');}});
} else {$('map-hint').textContent='地圖元件無法載入，仍可輸入座標規劃並下載 GPX。';}
input.addEventListener('input',update);
document.querySelectorAll('input[name="mode"]').forEach(radio=>radio.addEventListener('change',()=>{resetResult();status('模式已變更，請重新規劃路線。');}));
$('api-key').addEventListener('input',()=>{resetResult();$('key-state').textContent=$('api-key').value.trim()?'已填入 API Key':'尚未設定 API Key';status('連線設定已更新，請重新規劃路線。');});
$('plan').onclick=plan;$('fit').onclick=fit;
$('clear').onclick=()=>{input.value='';update();};
$('example').onclick=()=>{input.value='25.03753, 121.49988, 龍山寺\n25.03674, 121.50285, 剝皮寮歷史街區\n25.04210, 121.50794, 西門紅樓\n25.04778, 121.51704, 台北車站';update();fit();};
$('export').onclick=()=>{if(!result)return;const blob=new Blob([makeGpx(result.feature.geometry.coordinates,result.points)],{type:'application/gpx+xml;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pasufainda-walk.gpx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
update();
