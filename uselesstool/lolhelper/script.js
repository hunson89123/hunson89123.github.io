const summonerInfo = document.getElementById('summonerInfo');
$('#summonerForm').submit(function (event) {
    event.preventDefault();
    fetch('https://script.google.com/macros/s/AKfycbzRNXZEEnYfIU7HM_MmDqKueYdYgSxiTUuAjwjoIs1SzkwZhni1wy9XNn3WwHQC3E0J/exec')
        .then(response => response.text())
        .then(data => {
            summonerInfo.innerText = data;
        })
        .catch(error => summonerInfo.innerText = '錯誤:' + error);
});