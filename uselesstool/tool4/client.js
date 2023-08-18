// 寫入繪製內容
function writeToGoogleSheets(x0, y0, x1, y1) {
    const apiKey = 'AIzaSyAY2ZRf2PruKc-egnatTcn4PaB_mzHDXMM';
    const spreadsheetId = '1n3A5v4pxKZ6yzytGDUezmls5VeLVPrFyX8qF5QTtCKg';
    const range = 'A1:E1';
    const values = [[x0, y0, x1, y1, new Date().toString()]];

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            values: values,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Data written:', data);
        })
        .catch(error => {
            console.error('Error writing data:', error);
        });
}

// 讀取繪製內容
function readFromGoogleSheets() {
    const apiKey = 'your_api_key';
    const spreadsheetId = 'your_spreadsheet_id';
    const range = 'Sheet1';

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log('Data read:', data.values);
            // 在這裡處理繪製內容的讀取
        })
        .catch(error => {
            console.error('Error reading data:', error);
        });
}
