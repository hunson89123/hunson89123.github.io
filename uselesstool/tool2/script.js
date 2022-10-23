const reader = new FileReader()
const result = document.getElementById('result');
const submit = document.getElementById('submit');
const roomTitle = document.getElementById('roomTitle');
const members = document.getElementById('members');

let file = ''
let content = []
let memberLTemp = []
let memberList = []
document.getElementById('myFile').addEventListener('change', function () {
  result.textContent = '讀取中...';
  roomTitle.textContent = '--';
  members.textContent = '--';
  submit.disabled = true;
  file = this.files[0];
  reader.onload = function () {
    if (reader.result !== "") {
      if (file.name.startsWith('[LINE]') && reader.result.startsWith('[LINE]')) {
        result.textContent = '讀取成功!點擊右方"分析聊天!"查看結果!→';
        content = reader.result.split('\n');
        submit.disabled = false;
      } else
        result.textContent = '讀取失敗!非LINE聊天紀錄txt檔';
    } else {
      result.textContent = '讀取失敗!內容為空!';
    }
  }
  reader.readAsText(file);
})

function submitFile() {
  roomTitle.textContent = content[0].substring(7)
  result.textContent = '聊天紀錄' + content[1];
  members.textContent = "";
  for (var i = 3; i < content.length; i++) {
    memberLTemp.push(content[i].split('\t')[1]);
    memberList = memberLTemp.filter(function (item, pos) {
      return memberLTemp.indexOf(item) == pos && item !== undefined;
    });
    // members.textContent += content[i].split('\t')[1] + '\n'

  }
  members.textContent = memberList;
  console.log(memberList)
}