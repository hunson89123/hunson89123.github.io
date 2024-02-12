$('#summonerForm').submit(function (event) {
    event.preventDefault();
    const riotAPIKey = process.env.RIOTAPIKEY;
    const search_text = $('#search_input').val().split('#');
    const gameName = search_text[0]
    const tagLine = search_text[1]

    $.ajax({
        url: `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${riotAPIKey}`,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7,zh-CN;q=0.6",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://developer.riotgames.com",
            "X-Riot-Token": riotAPIKey
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