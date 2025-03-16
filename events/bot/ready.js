const { REST, Routes, Events, ActivityType } = require("discord.js");
const createquiz = require("../../helpers/createquiz");
const quiz = require("../../quiz.json");
const setting = require("../../setting.json");
module.exports = {
  name: Events.ClientReady,
  async execute(client, Log) {
    Log.info(`Logged in as ${client.user.tag}`);
    Log.info("Rebuiding command...");
    const commandsData = client.commands.map(command => command.build());
    Log.info(`Rebuilt ${commandsData.length} commands`);
    Log.info("Deploying command...");
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commandsData },
    ).then((data) => {
      Log.info(`Deployed ${data.length} commands`);
    }).catch((error) => {
      Log.error(error)
    });
    client.user.setPresence({ activities: [{ name: `/help`, type: ActivityType.Streaming }] });
    const resetTime = setting.quiz.resetTime;
    const NowTime = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
    const NowHours = new Date(NowTime).getHours()
    const guild = client.guilds.cache.get(setting.bot.serverid);
    const channel = guild.channels.cache.get(setting.bot.channelid);
    setInterval(() => {
      if (resetTime == NowHours) {
        let random = Math.floor(Math.random() * quiz.length);
        const data = createquiz(random);
        channel.send({
          embeds: [data.embed], components: [data.row]
        });
      }
    }, 60 * 15 * 1000);
  }
}