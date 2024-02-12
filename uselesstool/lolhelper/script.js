// Riot Games API Key
const riotAPIKey = 'RGAPI-495383cb-7896-4df5-b538-6c1358042473';

$('#summonerForm').submit(function (event) {
    event.preventDefault();
    const search_text = $('#search_input').val().split('#');
    const gameName = search_text[0]
    const tagLine = search_text[1]

    $.ajax({
        url: `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${riotAPIKey}`,
        headers: {
            'X-Riot-Token': riotAPIKey
        },
        success: function (data) {
            const summonerInfo = `
                <h2>您的召喚師ID為</h2>
                <p>${data.puuid}</p>
            `;
            $('#summonerInfo').html(summonerInfo);
        },
        error: function (x, s, error) {
            console.log(s);
            $('#summonerInfo').html(`<p>錯誤: ${error.responseText}</p>`);
        }
    });
});