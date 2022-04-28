const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const {
    getSummonerMmrByName,
    getSummonerDataByName,
    getRankDataById,
} = require("../api_requests");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("returns rank information of given summoner")
        .addStringOption((option) =>
            option
            .setName("summoner")
            .setDescription("Summoner's name")
            .setRequired(true)
        )
        .addStringOption((option) =>
            option
            .setName("region")
            .setDescription("Summoner's region")
            .setRequired(false)
        ),
    async execute(interaction) {
        const region = interaction.options.getString("region");
        const summonerName = interaction.options.getString("summoner");
        const summonerData = await getSummonerDataByName(summonerName, region);

        if (!summonerData) {
            return await interaction.editReply("Summoner not found");
        }
        const { name, profileIconId, id, summonerLevel } = summonerData;
        const mmrData = await getSummonerMmrByName(name, region);
        const rankData = await getRankDataById(id, region);

        let fields = [];

        if (!rankData) {
            return await interaction.editReply("Summoner has no rank");
        }
        const gameMode = rankData.find(
            (rank) => rank.queueType === "RANKED_SOLO_5x5"
        );

        if (!gameMode) {
            return await interaction.editReply("Summoner is not ranked in Solo 5v5");
        }

        const { rank, tier, leaguePoints, wins, losses } = gameMode;
        let games = wins + losses;
        let winrate = ((wins / games) * 100).toFixed(1);

        fields.push({
            name: "**Summoner Stats**",
            value: `**Level:** ${summonerLevel}\n**Rank:** ${tier} ${rank}\n **LP:** ${leaguePoints}`,
            inline: true,
        }, {
            name: "**Win/Lose Ratio**",
            value: `**Games:** ${games}\n**Wins:** ${wins}\n **Losses:** ${losses} \n **Winrate:** ${winrate}%`,
            inline: true,
        });

        let footer, rankText;
        if (mmrData) {
            const { avg, closestRank, timestamp, percentile } = mmrData;

            if (percentile >= 50) {
                rankText = `top ${100 - percentile}% of `;
            } else {
                rankText = `bottom ${percentile}% of `;
            }

            let time = new Date(0);
            time.setUTCSeconds(timestamp);
            time = time.toString().slice(0, 24);

            footer = `MMR data from ${time}`;
            fields.push({
                name: "**MMR**",
                value: `**Ranked:** ${avg} (${rankText + closestRank})`,
            });
        } else {
            footer = "MMR data not available";
        }

        const rankEmbed = new MessageEmbed()
            .setTitle(`**${summonerData.name}**`)
            .setThumbnail(
                `https://ddragon.leagueoflegends.com/cdn/12.5.1/img/profileicon/${profileIconId}.png`
            )
            .setColor(0x7289da)
            .addFields(fields)
            .setFooter({ text: footer });

        await interaction.editReply({
            embeds: [rankEmbed],
        });
    },
};