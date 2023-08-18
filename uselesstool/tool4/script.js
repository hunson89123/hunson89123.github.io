const sheetId = '1n3A5v4pxKZ6yzytGDUezmls5VeLVPrFyX8qF5QTtCKg';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const query = encodeURIComponent('Select *');
const sheetName = ['room'];
var url = `${base}&sheet=${sheetName[0]}&tq=${query}`
fetch(url)
    .then(res => res.text())
    .then(rep => {
        //Remove additional text and extract only JSON:
        const jsonData = JSON.parse(rep.substring(47).slice(0, -2));
        console.log(jsonData)
    })
function genRoomId() {
    var roomId = "";
    for (var x = 0; x < 4; x++) {
        var idStr = Math.floor(Math.random() * 10) + '';
        roomId += idStr;
    }
    return roomId;
}

function createRoom(b) {
    b.innerHTML = genRoomId();

    var dataToUpdate = "New Value";
    fetch('https://script.google.com/1Q0IhfpZfY0h2HTO6fo8fImJa5Ho8ur0nHJcFYLw9wTx4Aun4BPBx7PSD/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(dataToUpdate)
    })
        .then(response => response.text())
        .then(result => {
            console.log('Data updated:', result);
        })
        .catch(error => {
            console.error('Error updating data:', error);
        });
    // console.log(genRoomId());
}