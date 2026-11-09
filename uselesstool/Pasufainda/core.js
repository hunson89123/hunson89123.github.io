export function parseCoordinates(text, max = 50) {
  const lines = text.split(/\r?\n/).map((text, index) => ({text: text.trim(), line: index + 1})).filter(x => x.text);
  if (lines.length > max) throw new Error(`最多支援 ${max} 個地點，目前有 ${lines.length} 個。`);
  return lines.map(({text, line}) => {
    const match = text.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*[,，\s]\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*[,，]\s*(.+))?$/);
    if (!match) throw new Error(`第 ${line} 行格式不正確，請使用「緯度, 經度, 名稱（選填）」。`);
    const lat = Number(match[1]), lng = Number(match[2]);
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error(`第 ${line} 行超出範圍：緯度 -90～90，經度 -180～180。請確認緯度在前。`);
    return {lat, lng, name: match[3]?.trim() || `地點 ${line}`};
  });
}

// Held–Karp: exact minimum duration for this directed matrix, endpoints fixed.
export function optimalOrder(matrix) {
  const n = matrix?.length;
  if (!Number.isInteger(n) || n < 2 || n > 12 || matrix.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('步行時間矩陣格式不正確。');
  const cost = (a,b) => typeof matrix[a][b] === 'number' && Number.isFinite(matrix[a][b]) && matrix[a][b] >= 0 ? matrix[a][b] : Infinity;
  if(n === 2) { if (!Number.isFinite(cost(0,1))) throw new Error('這些地點之間沒有可連通的步行路線。'); return [0,1]; }
  const m = n - 2, size = 1 << m;
  const dp = Array.from({length:size}, () => new Float64Array(m).fill(Infinity));
  const parent = Array.from({length:size}, () => new Int16Array(m).fill(-1));
  for(let j=0;j<m;j++) dp[1<<j][j] = cost(0,j+1);
  for(let mask=1;mask<size;mask++) for(let j=0;j<m;j++) {
    if(!(mask & (1<<j)) || !Number.isFinite(dp[mask][j])) continue;
    for(let k=0;k<m;k++) if(!(mask & (1<<k))) {
      const next = mask | (1<<k), value = dp[mask][j] + cost(j+1,k+1);
      if(value < dp[next][k]) {dp[next][k]=value;parent[next][k]=j;}
    }
  }
  let end=-1,best=Infinity;
  for(let j=0;j<m;j++) {const value=dp[size-1][j]+cost(j+1,n-1);if(value<best){best=value;end=j;}}
  if(end<0) throw new Error('這些地點之間沒有可連通的步行路線，請調整座標。');
  let mask=size-1; const order=[n-1];
  while(end>=0){order.push(end+1);const prev=parent[mask][end];mask^=1<<end;end=prev;}
  order.push(0);return order.reverse();
}

export function escapeXml(text) {return String(text).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));}
export function makeGpx(coordinates, points) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Pasufainda" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>Pasufainda 步行路線</name></metadata>${points.map(p=>`<wpt lat="${p.lat}" lon="${p.lng}"><name>${escapeXml(p.name)}</name></wpt>`).join('')}<trk><name>步行路線</name><trkseg>${coordinates.map(c=>`<trkpt lat="${c[1]}" lon="${c[0]}"></trkpt>`).join('')}</trkseg></trk></gpx>`;
}
