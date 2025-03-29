const { REST, Routes, Events, ActivityType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { spreadsheet } = require('../../libs');
const createquiz = require('../../helpers/createquiz');
const setting = require('../../setting.json');

const resetTime = setting.quiz.resetTime;
let NowHours = parseInt(new Date().toLocaleTimeString('ja-JP', { timeZone: setting.quiz.timeZone, hour: 'numeric', hour12: false }));
const spsheet = new spreadsheet();

/**
 * Discordクライアントの準備完了時に実行されるイベント処理。
 * コマンドの再構築とデプロイを行い、定期的にクイズを投稿する処理を実行する。
 * 
 * @module ClientReady
 */
module.exports = {
  name: Events.ClientReady,

  /**
   * クライアントが準備完了したときに実行される関数。
   * 
   * @async
   * @param {import('discord.js').Client} client - Discordクライアントオブジェクト
   * @param {Object} Log - ロギングオブジェクト
   * @returns {Promise<void>}
   */
  async execute(client, Log) {
    Log.info(`Logged in as ${client.user.tag}`);

    // コマンドの再構築
    Log.info('Rebuilding commands...');
    const commandsData = client.commands.map(command => command.build());
    Log.info(`Rebuilt ${commandsData.length} commands`);

    // コマンドのデプロイ
    Log.info('Deploying commands...');
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    rest.put(
      Routes.applicationCommands(client.user.id, setting.bot.serverid),
      { body: commandsData },
    ).then((data) => {
      Log.info(`Deployed ${data.length} commands`);
      Log.info(`Ready!`);
    }).catch((error) => {
      Log.error(error);
    });

    // Botのプレゼンスを設定
    client.user.setPresence({
      activities: [{ name: setting.bot.activitiename, type: ActivityType.Streaming }]
    });

    // 指定されたサーバーとチャンネルを取得
    const guild = await client.guilds.fetch(setting.bot.serverid);
    const channel = guild.channels.cache.get(setting.bot.channelid);

    // 一定時間ごとにクイズ投稿の確認を実行
    setInterval(async () => {
      NowHours = parseInt(new Date().toLocaleTimeString('ja-JP', { timeZone: setting.quiz.timeZone, hour: 'numeric', hour12: false }));

      // 現在の時刻がクイズリセット時間と一致する場合、クイズを投稿する
      if (resetTime == NowHours) {
        const lastcount = await spsheet.all({ type: 'system' });
        const last_message = await spsheet.find({ type: 'system', count: lastcount.length });

        const timestamp = new Date().toLocaleString('ja-JP', { timeZone: setting.quiz.timeZone });
        const OldTime = new Date(last_message?.date);
        const diff = new Date(timestamp).getTime() - OldTime.getTime();
        const checkTime = isNaN(diff) ? 25 : diff / (60 * 60 * 1000);

        // 最後のクイズ投稿から12時間未満の場合、新しいクイズを投稿しない
        if (checkTime < 12) return;

        // 前回のクイズメッセージを取得し、回答ボタンを追加
        const Oldmessage = await channel.messages.fetch(last_message?.mid);
        const num = last_message?.count || 0;
        if (last_message?.mid) {
          const Button = new ButtonBuilder()
            .setCustomId(`quiz_${num - 1}_answer`)
            .setLabel('Answer')
            .setStyle(ButtonStyle.Success);
          const row = new ActionRowBuilder().addComponents(Button);
          Oldmessage.edit({ components: [row] });
        }

        // 新しいクイズを作成し、チャンネルに送信
        const data = createquiz(num);
        const message = await channel.send({
          embeds: [data.embed], components: [data.row]
        });

        // クイズデータをスプレッドシートに保存
        spsheet.set({
          type: 'system',
          count: Number(num) + 1,
          mid: message.id,
          total_count: 0,
          answer_count: 0,
          date: timestamp
        });
      }
    }, 60 * setting.quiz.checkTime * 1000); // 設定された間隔でクイズチェックを実行
  }
};
