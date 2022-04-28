const { Client, Intents, Collection } = require("discord.js");
const fs = require("node:fs");
const { token } = require("./data/config.json");

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.commands = new Collection();
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.data.name, command);
}

client.on("ready", () => {
    console.log(`Logged in as  ${client.user.tag}`);
    client.user.setActivity(`help`);
});

client.on("interactionCreate", async(interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await interaction.deferReply();
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: "There was en error while executing this command!",
            ephemeral: true,
        });
    }
});

// guild slash = instant
// global commands = takes hours

client.login(token);