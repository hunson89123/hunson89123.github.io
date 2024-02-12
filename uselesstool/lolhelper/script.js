const summonerInfo = document.getElementById('summonerInfo');
$('#summonerForm').submit(function (event) {
    event.preventDefault();
    // 定義一個全局函數來處理 JSONP 回調


    // 創建一個 <script> 標籤來發送 JSONP 請求
    var script = document.createElement('script');
    script.src = 'https://script.google.com/macros/s/AKfycbzRNXZEEnYfIU7HM_MmDqKueYdYgSxiTUuAjwjoIs1SzkwZhni1wy9XNn3WwHQC3E0J/exec?callback=handleData';
    document.body.appendChild(script);

});
function handleData(data) {
    $('summonerInfo').innerText(data);
}