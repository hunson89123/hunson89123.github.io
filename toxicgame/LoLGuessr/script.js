$(document).ready(function () {
  const canvas = document.getElementById('cImg');
  const ctx = canvas.getContext("2d");
  const rankArr = ['unranked', 'iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master', 'grandmaster', 'challenger']
  let guessCount = 0;
  let randomChampionKey = '';
  let cData = null;
  let highScore = localStorage.getItem("highScore") || 0;
  $("#highScore").text(highScore);
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
            cData = data;
            const championKeys = Object.keys(cData.data);
            const randomIndex = Math.floor(Math.random() * championKeys.length);
            randomChampionKey = championKeys[randomIndex];
            const randomChampion = cData.data[randomChampionKey];
            const cImg = new Image();
            cImg.crossOrigin = "anonymous";
            cImg.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${randomChampion.id}.png`;
            cImg.onload = () => {
              const pixelSize = cImg.width / (Math.max(15 - guessCount, 2)); // 像素大小
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
              data: Object.values(cData.data).map(c => ({ id: c.id, text: c.name })).sort((a, b) => a.id - b.id),
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
            }).select2('open');
          });
      })
      .catch(error => {
        console.error('Fetch 發生錯誤:', error);
      });


  }

  $('#submit').click(e => {
    const val = $('#championSelect').val();

    if (val === randomChampionKey) {
      newChampion();
      guessCount++;
      $('#guess_count').text(guessCount);
      if (guessCount > highScore) {
        highScore = guessCount;
        localStorage.setItem("highScore", highScore);
        $("#highScore").text(highScore);
      }
    } else {
      $('#bg').addClass('wrong-answer');
      $('#championSelect').prop("disabled", true);
      $('#correctAns').text(cData.data[randomChampionKey].name);
      $('#gameover').css('visibility', 'visible');
      $('#tryagain').show();
    }
  });

  $('#tryagain').click(e => {
    newChampion();
    guessCount = 0;
    $('#guess_count').text(guessCount);

    $('#bg').removeClass('wrong-answer');
    $('#championSelect').prop("disabled", false);
    $('#correctAns').text('－');
    $('#gameover').css('visibility', 'hidden');
    $(e.target).hide();
  });
});