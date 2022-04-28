const { SlashCommandBuilder } = require("@discordjs/builders");
const api = require("../api_requests");
const { MessageEmbed } = require("discord.js");

const getChampById = async (championId) => {
  var champList = await api.getChampData();

  for (let key in champList.data.data) {
    let champ = champList.data.data[key];
    if (champ.key == championId) {
      return champ.id;
    }
  }
  return "N/A";
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("game")
    .setDescription("returns live game information of given summoner")
    .addStringOption((option) =>
      option
        .setName("summoner")
        .setDescription("Summoner's name")
        .setRequired(true)
    ),
  async execute(interaction) {
    let blue = [];
    let red = [];

    const summonerName = interaction.options.getString("summoner");
    let summonerData = await api.getSummonerDataByName(summonerName);
    let summonerId = summonerData.id;
    let spectatorData = await api.getGameDataById(summonerId);

    for (const summoner in spectatorData["participants"]) {
      let { summonerName, summonerId, championId, teamId } =
        spectatorData["participants"][summoner];
      let champ = await getChampById(championId);
      if (teamId === 100) {
        blue.push(`${summonerName}: ${champ}`);
      } else {
        red.push(`${summonerName}: ${champ}`);
      }
    }

    const gameEmbed = new MessageEmbed()
      .setTitle(`**${summonerName}'s game**`)
      .setColor(0x7289da)
      .addFields(
        {
          name: "**Red Team**",
          value: `${red.join("\n")}`,
          inline: true,
        },
        {
          name: "**Blue Team**",
          value: `${blue.join("\n")}`,
          inline: true,
        }
      );

    await interaction.editReply({
      embeds: [gameEmbed],
    });
  },
};
