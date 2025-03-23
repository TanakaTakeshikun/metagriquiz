const { REST, Routes, Events, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { SQLCommand } = require('../../libs');
const createquiz = require('../../helpers/createquiz');
const setting = require('../../setting.json');
const sql = new SQLCommand();
const resetTime = setting.quiz.resetTime;
let NowTime = new Date().toLocaleString({ timeZone: setting.quiz.timeZone });
let NowHours = new Date(NowTime).getHours();

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
      if (resetTime == NowHours) {
        NowTime = new Date().toLocaleString({ timeZone: setting.quiz.timeZone });
        NowHours = new Date(NowTime).getHours();
        const last_message = await sql.find({ type: 'system' });
        const OldTime = new Date(last_message?.date);
        const diff = new Date(NowTime).getTime() - OldTime.getTime();
        const checkTime = (diff == NaN) ? 25 : diff / (60 * 60 * 1000);
        if (checkTime < 24) return;
        const Oldmessage = await channel.messages.fetch(last_message?.mid);
        const num = last_message?.count || 0;
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
        if (last_message) {
          sql.update({ type: 'system', count: num + 1, mid: message.id });
        } else {
          sql.set({ type: 'system', count: num + 1, mid: message.id });
        }
      }
    }, 60 * setting.quiz.checkTime * 1000);
  }
}