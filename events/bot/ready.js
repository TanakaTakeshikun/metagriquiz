const { REST, Routes, Events, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { spreadsheet } = require('../../libs');
const createquiz = require('../../helpers/createquiz');
const setting = require('../../setting.json');
const resetTime = setting.quiz.resetTime;
let NowHours = parseInt(new Date().toLocaleTimeString('ja-JP', { timeZone: setting.quiz.timeZone, hour: 'numeric', hour12: false }))
const spsheet = new spreadsheet();
module.exports = {
  name: Events.ClientReady,
  async execute(client, Log) {
    Log.info(`Logged in as ${client.user.tag}`);
    Log.info('Rebuiding command...');
    const commandsData = client.commands.map(command => command.build());
    Log.info(`Rebuilt ${commandsData.length} commands`);
    Log.info('Deploying command...');
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    rest.put(
      Routes.applicationCommands(client.user.id, setting.bot.serverid),
      { body: commandsData },
    ).then((data) => {
      Log.info(`Deployed ${data.length} commands`);
      Log.info(`Ready!`);
    }).catch((error) => {
      Log.error(error)
    });
    client.user.setPresence({ activities: [{ name: setting.bot.activitiename, type: ActivityType.Streaming }] });
    const guild = await client.guilds.fetch(setting.bot.serverid);
    const channel = guild.channels.cache.get(setting.bot.channelid);
    setInterval(async () => {
      NowHours = parseInt(new Date().toLocaleTimeString('ja-JP', { timeZone: setting.quiz.timeZone, hour: 'numeric', hour12: false }))
      if (resetTime == NowHours) {
        const lastcount = await spsheet.all({ type: 'system' });
        const last_message = await spsheet.find({ type: 'system', count: lastcount.length });
        const timestamp = new Date().toLocaleString('ja-JP', { timeZone: setting.quiz.timeZone });
        const OldTime = new Date(last_message?.date);
        const diff = new Date(timestamp).getTime() - OldTime.getTime();
        const checkTime = (diff == NaN) ? 25 : diff / (60 * 60 * 1000);
        if (checkTime < 12) return;
        const Oldmessage = await channel.messages.fetch(last_message?.mid);
        const num = last_message?.count || 0
        if (last_message?.mid) {
          const Button = new ButtonBuilder()
            .setCustomId(`quiz_${num - 1}_answer`)
            .setLabel('Answer')
            .setStyle(ButtonStyle.Success);
          const row = new ActionRowBuilder()
            .addComponents(Button);
          Oldmessage.edit({ components: [row] });
        };
        const data = createquiz(num);
        const message = await channel.send({
          embeds: [data.embed], components: [data.row]
        });
        spsheet.set({ type: 'system', count: Number(num) + 1, mid: message.id, total_count: 0, answer_count: 0,date:timestamp });
      }
    }, 60 * setting.quiz.checkTime * 1000)
  }
}