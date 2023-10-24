var x = new Date(document.lastModified);
var s = document.getElementById('lastModified');
s.innerHTML = x.getFullYear() + "/" +
    String(x.getMonth() + 1).padStart(2, '0') + "/" +
    String(x.getDate()).padStart(2, '0') + " " +
    String(x.getHours()).padStart(2, '0') + ":" +
    String(x.getMinutes()).padStart(2, '0') + ":" +
    String(x.getSeconds()).padStart(2, '0');