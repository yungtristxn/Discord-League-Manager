const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const api = require("../api_requests");

const getNameList = async (summoners, discordId) => {
  let nameList = [];
  let summonerList;

  for (let i = 0; i < summoners.length; i++) {
    if (discordId in summoners[i]) {
      summonerList = summoners[i][discordId];
      for (let i = 0; i < summonerList.length; i++) {
        let summonerData = await api.getSummonerDataById(summonerList[i]);
        if (summonerData) {
          nameList.push(summonerData.name);
        }
      }
    }
  }
  return nameList;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listsummoners")
    .setDescription("lists all summoners bound to discord user"),
  async execute(interaction) {
    const discordId = interaction.user.id;
    let summonerJson = fs.readFileSync("./data/summoners.json", "utf-8");

    let summoners = JSON.parse(summonerJson);

    if (summoners[0][discordId].length === 0) {
      return interaction.editReply("You have no summoners bound to you");
    }

    const nameList = await getNameList(summoners, discordId);

    let output = [];
    let i = 0;
    nameList.forEach((name) => {
      output.push(`**[${i}]** ${name}, `);
      i++;
    });

    await interaction.editReply({
      content: `${output.join(" ")}`,
    });
  },
};
