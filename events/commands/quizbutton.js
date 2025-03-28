const { Events, Colors } = require('discord.js');
const { CustomEmbed, spreadsheet } = require('../../libs');
const setting = require("../../setting.json");

const spsheet = new spreadsheet();

/**
 * クイズ関連のエラー発生時に送信する埋め込みメッセージ。
 */
const error_embed = new CustomEmbed()
    .setTitle('エラー')
    .setDescription('不具合が発生しました。\n1分後もう一度お試しください')
    .setColor(Colors.Red)
    .create();

/** @type {Array<Object>} クイズデータのキャッシュ */
let quiz;

/**
 * スプレッドシートからクイズデータを取得し、キャッシュを更新する関数。
 * @async
 * @returns {Promise<void>}
 */
const quizupdate = async () => {
    const rawdata = await spsheet.all({ type: 'quizlist' });
    quiz = rawdata.map(({ _rawData }) => ({
        category: _rawData[0],
        question: _rawData[1],
        choices1: _rawData[2],
        choices2: _rawData[3],
        choices3: _rawData[4],
        choices4: _rawData[5],
        answer: _rawData[6],
        qid: _rawData[7]
    }));
};

quizupdate();

module.exports = {
    name: Events.InteractionCreate,
    filter: (i) => i.isButton() && i.customId.startsWith('quiz_'),

    /**
     * クイズのボタンが押されたときの処理。
     * 
     * @async
     * @param {import('discord.js').Interaction} interaction - Discordのインタラクションオブジェクト
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const guild = await interaction.client.guilds.fetch(setting.bot.serverid);
        const tokenchannel = guild.channels.cache.get(setting.bot.tokenchannel);
        const pointchannel = guild.channels.cache.get(setting.bot.pointchannel);
        const tokenrole = interaction.member.roles.cache.has(setting.bot.tokenroleid);

        // クイズのIDとユーザーの回答を取得
        const buttonCode = interaction.customId.split('_');
        const quizId = buttonCode[1];
        const answer = buttonCode[2];

        // クイズデータを取得・更新
        if (!quiz[quizId]) await quizupdate();
        if (!quiz[quizId]) return await interaction.reply({ embeds: [error_embed], flags: 'Ephemeral' });

        // ユーザーデータの取得
        const user_data = await spsheet.find({ uid: interaction.user.id, type: 'members' });
        const allcount = user_data?.allcount || 0;

        // 正答を表示する場合
        if (answer === 'answer') {
            const embed = new CustomEmbed()
                .setTitle('正答')
                .setDescription(`問題: ${quiz[quizId].question}\n正答: ${quiz[quizId]['choices' + quiz[quizId].answer]}\n総正答数: ${user_data?.count || 0}`)
                .setColor(Colors.Green)
                .create();
            return await interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
        }

        // すでに回答済みか確認
        if (user_data?.mid === interaction.message.id) {
            const embed = new CustomEmbed()
                .setTitle('注意: すでに回答済みです')
                .setDescription(`問題: ${quiz[quizId].question}\n正答: ${quiz[quizId]['choices' + quiz[quizId].answer]}\n総正答数: ${user_data?.count || 0}`)
                .setColor(Colors.Yellow)
                .create();
            return interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
        }

        // 正解の場合の処理
        if (quiz[quizId].answer == answer) {
            if (tokenrole) {
                tokenchannel.send(`${interaction.member}\nクイズ正解報酬 <@${setting.bot.tokenbotid}>`);
            } else {
                pointchannel.send(`${interaction.member}\nクイズ正解報酬 <@${setting.bot.pointobotid}>`);
            }

            if (user_data?.uid) {
                spsheet.update({
                    uid: interaction.user.id,
                    allcount: Number(allcount) + 1,
                    count: Number(user_data.count) + 1,
                    type: 'members',
                    mid: interaction.message.id
                });
            } else {
                spsheet.set({
                    uid: interaction.user.id,
                    allcount: Number(allcount || 1),
                    count: Number(user_data?.count || 1),
                    type: 'members',
                    mid: interaction.message.id
                });
            }

            const embed = new CustomEmbed()
                .setTitle('✅正解')
                .setDescription(`問題: ${quiz[quizId].question}\n回答: ${quiz[quizId]['choices' + answer]}\n総正答数: ${user_data?.count || 1}`)
                .setColor(Colors.Green)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' });

            const last_count = await spsheet.all({ type: 'system' });
            const last_content = await spsheet.find({ type: 'system', count: last_count.length });
            if (last_content) {
                spsheet.update({
                    type: 'system',
                    mid: interaction.message.id,
                    answer_count: Number(last_content.answer_count) + 1,
                    total_count: Number(last_content.total_count) + 1
                });
            }
        } else {
            // 不正解の処理
            if (user_data?.uid) {
                spsheet.update({
                    uid: interaction.user.id,
                    allcount: Number(allcount) + 1,
                    count: user_data.count,
                    type: 'members',
                    mid: interaction.message.id
                });
            } else {
                spsheet.set({
                    uid: interaction.user.id,
                    allcount: Number(allcount) + 1,
                    count: 0,
                    type: 'members',
                    mid: interaction.message.id
                });
            }

            const embed = new CustomEmbed()
                .setTitle('✖不正解')
                .setDescription(`問題: ${quiz[quizId].question}\n回答: ${quiz[quizId]['choices' + answer]}\n正答: ${quiz[quizId]['choices' + quiz[quizId].answer]}\n総正答数: ${user_data?.count || 0}`)
                .setColor(Colors.Red)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' });

            const last_count = await spsheet.all({ type: 'system' });
            const last_content = await spsheet.find({ type: 'system', count: last_count.length });
            if (last_content) {
                spsheet.update({
                    type: 'system',
                    mid: interaction.message.id,
                    total_count: Number(last_content.total_count) + 1
                });
            }
        }
    }
};
