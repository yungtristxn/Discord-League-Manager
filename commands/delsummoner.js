const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delsummoner")
    .setDescription(
      "unbinds summoner from account, get list with /listsummoners"
    )
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("which bound account should be deleted")
        .setRequired(true)
    ),
  async execute(interaction) {
    const discordId = interaction.user.id;
    const id = interaction.options.getInteger("id");
    let summonerJson = fs.readFileSync("./data/summoners.json", "utf-8");

    let summoners = JSON.parse(summonerJson);

    summoners.find(async (summoner) => {
      if (summoner[discordId]) {
        if (summoner[discordId][id]) {
          summoner[discordId].splice(id, 1);

          await interaction.editReply({
            content: `Removed summoner at slot ${id}`,
          });

          summonerJson = JSON.stringify(summoners);
          fs.writeFileSync("./data/summoners.json", summonerJson, "utf-8");
          return;
        }
      }
      await interaction.editReply({
        content: `Could not find summoner at ${id} in account <@${discordId}>`,
      });
    });
  },
};
