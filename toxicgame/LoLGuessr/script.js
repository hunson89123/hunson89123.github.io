$(document).ready(function () {
  const canvas = document.getElementById('cImg');
  const ctx = canvas.getContext("2d");
  const rankArr = ['unranked', 'iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger']
  let gameStart = false;
  let end = null;
  let rankCount = 0;
  let randomChampionKey = '';
  newChampion();
  function newChampion() {
    let version = '';
    fetch('https://ddragon.leagueoflegends.com/realms/tw.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        version = data.v;
        fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/zh_TW/champion.json`)
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          }).then(data => {
            const championKeys = Object.keys(data.data);
            const randomIndex = Math.floor(Math.random() * championKeys.length);
            randomChampionKey = championKeys[randomIndex];
            const randomChampion = data.data[randomChampionKey];
            const cImg = new Image();
            cImg.crossOrigin = "anonymous";
            cImg.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${randomChampion.id}.png`;
            cImg.onload = () => {
              const pixelSize = cImg.width / (Math.max(15 - rankCount, 2)); // 像素大小
              canvas.width = cImg.width;
              canvas.height = cImg.height;

              // 縮小圖片
              const tempCanvas = document.createElement("canvas");
              const tempCtx = tempCanvas.getContext("2d");
              tempCanvas.width = cImg.width / pixelSize;
              tempCanvas.height = cImg.height / pixelSize;
              tempCtx.drawImage(cImg, 0, 0, tempCanvas.width, tempCanvas.height);

              // 放大回原尺寸
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, cImg.width, cImg.height);
            };
            $(`#championSelect option`).remove();
            $('#championSelect').select2({
              data: Object.values(data.data).map(c => ({ id: c.id, text: c.name })).sort((a, b) => a.id - b.id),
              placeholder: "搜尋英雄...",
              matcher: function (params, data) {
                if ($.trim(params.term) === '') {
                  return data;
                }
                if (data.text.toLowerCase().includes(params.term.toLowerCase()) ||
                  data.id.toLowerCase().includes(params.term.toLowerCase())) {
                  return data;
                }
                return null;
              },
              language: {
                noResults: function () {
                  return "查無此英雄:(";
                }
              }
            });
          });
      })
      .catch(error => {
        console.error('Fetch 發生錯誤:', error);
      });


  }

  $('#submit').click(e => {
    const val = $('#championSelect').val();

    if (!gameStart) {
      end = Date.now() + 30000;
      countdown();
      gameStart = true;
    }
    $('#championSelect').val(null);
    if (val === randomChampionKey) {
      newChampion();
      rankCount++;
    } else {
      $(`#championSelect option[value="${val}"]`).remove();
      $("body").removeClass("wrong-answer");

      requestAnimationFrame(() => {
        $("body").addClass("wrong-answer");
      });
      $('#championSelect').select2('open');
    }

  });

  function countdown() {
    let remaining = Math.max(end - Date.now(), 0);
    let str = new Date(remaining).toISOString();
    $('#timer').html(`${str.slice(17, 19)}<span id="timerMS">${str.slice(19, 22)}</span>`)
    if (remaining > 0) {
      requestAnimationFrame(countdown);
    } else {
      gameStart = false;
    }
  }
});