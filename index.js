const { Client, GatewayIntentBits, Partials } = require('discord.js');
const path = require('node:path');
const { EventHandler, CommandsBuilder, spreadsheet } = require('./libs');
const logger = require('./helpers/getLogger');
const sp = new spreadsheet();

const insertMany = async () => {
    console.log(await sp.find({type:"members",uid:"a"}))
}
insertMany()
require('dotenv').config()
const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    allowedMentions: { repliedUser: false },
    rest: 60000
});
client.logger = logger;

EventHandler(client, path.resolve(__dirname, './events'));
client.commands = CommandsBuilder(client, path.resolve(__dirname, './commands'));


process.on('uncaughtException', (error) => {
    console.error(error)
});

client.login(process.env.TOKEN);