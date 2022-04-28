const { SlashCommandBuilder, roleMention } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const {
    getSummonerMmrByName,
    getSummonerDataByName,
    getRankDataById,
} = require("../api_requests");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lobby")
        .setDescription("returns information about summoners in champ select")
        .addStringOption((option) =>
            option
            .setName("summoners")
            .setDescription("name of summoners")
            .setRequired(true)
        ),
    async execute(interaction) {
        const summonerNames = interaction.options.getString("summoners");

        const summoners = summonerNames.split(" joined the lobby");

        summoners.pop();

        if (summoners.length > 5 || summoners.length === 0) {
            return await interaction.editReply(
                "You must provide at least one and no more than 5 summoners"
            );
        }

        let summonerFields = [];
        let totalMmr = 0;
        let mmrCount = 0;

        for (let i = 0; i < summoners.length; i++) {
            const summonerData = await getSummonerDataByName(summoners[i]);
            const rankData = await getRankDataById(summonerData.id);
            const mmrData = await getSummonerMmrByName(summoners[i]);

            let currentSummoner = { name: `**${summonerData.name}**`, inline: true };

            if (rankData) {
                const gameMode = rankData.find(
                    (rank) => rank.queueType === "RANKED_SOLO_5x5"
                );

                if (!gameMode) {
                    currentSummoner.value = "N/A";
                    summonerFields.push(currentSummoner);
                    continue;
                }

                const { rank, tier, leaguePoints, wins, losses } = gameMode;
                let games = wins + losses;
                let winrate = ((wins / games) * 100).toFixed(1);

                currentSummoner.value = `**Games:** ${games}\n**Winrate:** ${winrate}%\n**Rank:** ${tier} ${rank}\n**LP:** ${leaguePoints}\n`;
            }

            if (mmrData) {
                const { avg, closestRank } = mmrData;
                totalMmr += avg;
                mmrCount += 1;

                if (currentSummoner.value) {
                    currentSummoner.value = `${currentSummoner.value} **MMR:** ${avg}\n**Closest Rank:** ${closestRank}`;
                }
            }

            summonerFields.push(currentSummoner);
        }

        if (summonerFields.length % 2 !== 0) {
            summonerFields.push({
                name: "\u200b",
                value: "\u200b",
                inline: true,
            });
        }

        const embed = new MessageEmbed()
            .setTitle("Summoners in Champ Select")
            .setDescription(`**Average MMR:** ${(totalMmr / mmrCount).toFixed(0)}`)
            .setColor("#0099ff")
            .addFields(summonerFields);

        await interaction.editReply({
            embeds: [embed],
        });
    },
};