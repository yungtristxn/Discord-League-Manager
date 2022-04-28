const { SlashCommandBuilder } = require("@discordjs/builders");
const { riotKey } = require("../data/config.json");
const fs = require("fs");
const api = require("../api_requests");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addsummoner")
    .setDescription("adds given summoner to discord user")
    .addStringOption((option) =>
      option
        .setName("summoner")
        .setDescription("Summoner name")
        .setRequired(true)
    ),
  async execute(interaction) {
    const summonerName = interaction.options.getString("summoner");
    const result = await api.getSummonerDataByName(summonerName);

    if (!result.status) {
      const discordId = interaction.user.id;
      let summonerJson = fs.readFileSync("./data/summoners.json", "utf-8");

      let summoners = JSON.parse(summonerJson);

      for (let i = 0; i < summoners.length; i++) {
        if (discordId in summoners[i]) {
          var foundUser = true;
          let summonerList = summoners[i][discordId];
          if (!summonerList.includes(`${result.id}`)) {
            summonerList.push(result.id);
            summoners[i][discordId] = summonerList;
            var response = "Summoner has been bound to your account!";
          } else {
            var response = "This Summoner is already bound to your account!";
          }
        }
      }

      if (!foundUser) {
        let newSummoner = { [discordId]: [result.id] };
        summoners.push(newSummoner);
        var response = "Summoner has been bound to your account!";
      }

      summonerJson = JSON.stringify(summoners);
      fs.writeFileSync("./data/summoners.json", summonerJson, "utf-8");
    } else {
      var response = "Couldn't find summoner!";
    }
    await interaction.editReply({
      content: `${response}`,
    });
  },
};
