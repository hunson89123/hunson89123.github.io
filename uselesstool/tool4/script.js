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
}