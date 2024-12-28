document.addEventListener("DOMContentLoaded", () => {
  const cImg = document.getElementById('cImg');
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
      fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/zh_TW/champion.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        }).then(data => {
          const championKeys = Object.keys(data.data);

          const randomIndex = Math.floor(Math.random() * championKeys.length);
          const randomChampionKey = championKeys[randomIndex];

          const randomChampion = data.data[randomChampionKey];
          cImg.src = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${randomChampion.id}.png`;
        });
    })
    .catch(error => {
      console.error('Fetch 發生錯誤:', error);
    });
});
