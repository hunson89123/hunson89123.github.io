import Map from './ol/Map.js';
import OSM from './ol/source/OSM.js';
import StadiaMaps from './ol/source/StadiaMaps.js';
import TileLayer from './ol/layer/Tile.js';
import View from './ol/View.js';

export function loadMap(lng, lat, zom) {
    var vector = new ol.layer.Heatmap({
        // 資料來源
        source: new ol.source.Vector({
            // 網址
            // url: 'https://openlayers.org/en/v4.6.5/examples/data/kml/2012_Earthquakes_Mag5.kml',
            // 資料格式
            format: new ol.format.KML({
                extractStyles: true
            })
        }),
        // 模糊度
        blur: 25,
        // 半徑
        radius: 6
    });

    const raster = new TileLayer({
        source: new OSM({
            layer: 'stamen_toner',
        }),
    });

    const map = new Map({
        // 目標html element id
        target: 'demoMap',
        //
        layers: [raster, vector],
        view: new View({
            center: ol.proj.fromLonLat([lng, lat]),
            zoom: zom,
        }),
    });

    setInterval(function () {
        map.setZoom(0);
        setTimeout(function () {
            map.setZoom(1);
        }, 2000);
    }, 4000);
}