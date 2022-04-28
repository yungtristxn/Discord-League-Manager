const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const api = require("../api_requests");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("gets all stats of user based on registered summoners"),
  async execute(interaction) {
    const discordId = interaction.user.id;
    const avatarURL = interaction.user.displayAvatarURL({ format: "png" });

    let summonerJson = fs.readFileSync("./data/summoners.json", "utf-8");
    let summoners = JSON.parse(summonerJson);

    let summonerList;
    for (let i = 0; i < summoners.length; i++) {
      if (discordId in summoners[i]) {
        summonerList = summoners[i][discordId];
      }
    }

    if (!summonerList) {
      return interaction.editReply("You have no summoners bound to you");
    }

    let rankedWins = 0;
    let rankedLosses = 0;
    for (let i = 0; i < summonerList.length; i++) {
      const rankData = await api.getRankDataById(summonerList[i]);
      if (!rankData) {
        continue;
      }

      const soloQueueData = rankData.find(
        (rank) => rank.queueType === "RANKED_SOLO_5x5"
      );
      if (!soloQueueData) {
        continue;
      }

      const { wins, losses } = soloQueueData;
      rankedWins += wins;
      rankedLosses += losses;
    }
    const rankEmbed = new MessageEmbed()
      .setTitle(`**All stats combined:**`)
      .setThumbnail(avatarURL)
      .setColor(0x7289da)
      .addFields({
        name: "**Total ranked games**",
        value: `**Games:** ${
          rankedWins + rankedLosses
        }\n**Wins:** ${rankedWins}\n **Losses:** ${rankedLosses} \n **Winrate:** ${(
          (rankedWins / (rankedWins + rankedLosses)) *
          100
        ).toFixed(2)}%`,
        inline: true,
      });

    await interaction.editReply({ embeds: [rankEmbed] });
  },
};
