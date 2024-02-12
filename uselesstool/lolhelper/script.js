const summonerInfo = document.getElementById('summonerInfo');
$('#summonerForm').submit(function (event) {
    event.preventDefault();
    fetch('https://script.google.com/macros/s/AKfycby-KC8thyRgCvlES2_FttdsUQC6qfxwXIM-Jq8BqnD51VlS2OLdVChuTqK7vrS35KSB/exec')
        .then(response => response.text())
        .then(data => {
            summonerInfo.innerText = data;
        })
        .catch(error => summonerInfo.innerText = '錯誤:' + error);
});