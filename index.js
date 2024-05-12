const { ButtonStyle, Client, GatewayIntentBits, REST, Routes, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const JSONDb = require("simple-json-db");
const fs = require("fs");
const path = require("path");
const links = require("./links.json");

fs.writeFile(path.join(dirname, "dispenses.json"), "{}", { flag: "wx" }, function (err) {});
const db = new JSONDb(path.join(dirname, "dispenses.json"));

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.on("ready", () => {
    console.log("Bot running.")
});

const registerRest = async function() {
    const rest = new REST({
        version: "10"
    }).setToken("token");
    await rest.put(
        Routes.applicationCommands("id"),
        {body: [{"name": "setup", description: "Set up dispenser."}]}
    );
};

registerRest();

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId == "dispense") {
            const id = interaction.member.id;
            let currentNumber = 0;
            if (db.has(id)) {
                currentNumber = parseInt(db.get(id));
                if (currentNumber >= 3) {
                    await interaction.reply({
                        content: "You have dispensed your maximum amount of links this week. Your numbers will be reset next Monday.",
                        ephemeral: true
                    });
                    return;
                }
            }
            currentNumber++;
            const type = Object.keys(links)[Math.floor(Math.random() * Object.keys(links).length)];
            const link = links[type][Math.floor(Math.random() * links[type].length)];
            await interaction.reply({
                content: Your link is: \${link}` on a `${type}` proxy. You have used ${currentNumber}/3 of your weekly links.`,
                ephemeral: true
            });
            db.set(id, currentNumber);
            db.sync();
        }
    }
    if (!interaction.isChatInputCommand()) {
        return;
    }
    if (interaction.commandName === "setup") {
        const dispense = new ButtonBuilder()
            .setCustomId("dispense")
            .setLabel("Dispense Link")
            .setStyle(ButtonStyle.Primary);
        await interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Link Dispenser")
                    .setDescription(" ➜ Click the button to dispense a link\n ➜ You may only dispense 3 links in a week\n ➜ Your weekly links will reset every Monday")
                    .setColor("NotQuiteBlack")
            ],
            components: [
                (new ActionRowBuilder())
                    .addComponents(dispense)
            ]
        });
    }
});

client.login("token");
