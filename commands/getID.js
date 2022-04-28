const { SlashCommandBuilder } = require("@discordjs/builders");
const { getSummonerDataByName } = require("../api_requests");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getid")
        .setDescription("returns ID of given summoners")
        .addStringOption((option) =>
            option
            .setName("summoner")
            .setDescription("Summoner's name")
            .setRequired(true)
        ),

    async execute(interaction) {
        const summonerName = interaction.options.getString("summoner");
        const summonerData = await getSummonerDataByName(summonerName);

        if (!summonerData) {
            return interaction.editReply("Summoner not found");
        }
        const { id, name } = summonerData;

        return interaction.editReply(`Name: ${name}\nID: ${id}`);
    },
};