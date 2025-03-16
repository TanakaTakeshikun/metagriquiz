const { Client, GatewayIntentBits, Partials } = require("discord.js");
const path = require("path");
const { EventHandler, CommandsBuilder } = require("./libs");
const logger = require("./helpers/getLogger");
require("dotenv").config()
// require("./helpers/dbsetup")()実装中
const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    allowedMentions: { repliedUser: false },
    rest: 60000
});
client.logger = logger;

EventHandler(client, path.resolve(__dirname, "./events"));
client.commands = CommandsBuilder(client, path.resolve(__dirname, "./commands"));


process.on("uncaughtException", (error) => {
    Log.error(error)
});

client.login(process.env.TOKEN);