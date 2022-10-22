const reader = new FileReader()
const result = document.getElementById('result')
document.getElementById('myFile').addEventListener('change', function () {
  result.textContent = '讀取中...'
  reader.onload = function () {
    if (reader.result !== null) {
      result.textContent = '讀取成功!'
    } else {
      result.textContent = 'Error!'
    }
  }
  reader.readAsText(this.files[0]);
})