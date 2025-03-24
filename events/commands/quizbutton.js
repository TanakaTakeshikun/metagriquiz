const { Events, Colors } = require('discord.js');
const { CustomEmbed, spreadsheet } = require('../../libs');
const setting = require("../../setting.json")
const spsheet = new spreadsheet();
const error_embed = new CustomEmbed()
    .setTitle('エラー')
    .setDescription(`不具合が発生しました。\n1分後もう一度お試しください`)
    .setColor(Colors.Red)
    .create();
let quiz;
(async () => {
    const rawdata = await spsheet.all({ type: 'quizlist' });
    quiz = rawdata.map(({ _rawData }) => ({ category: _rawData[0], question: _rawData[1], choices1: _rawData[2], choices2: _rawData[3], choices3: _rawData[4], choices4: _rawData[5], answer: _rawData[6], qid: _rawData[7] }))
})();
module.exports = {
    name: Events.InteractionCreate,
    filter: (i) => i.isButton() && i.customId.startsWith('quiz_'),
    async execute(interaction) {
        const guild = await interaction.client.guilds.fetch(setting.bot.serverid);
        const tokenchannel = guild.channels.cache.get(setting.bot.tokenchannel);
        const pointchannel = guild.channels.cache.get(setting.bot.pointchannel);
        const tokenrole = interaction.member.roles.cache.has(setting.bot.tokenroleid);
        const buttonCode = interaction.customId.split('_');
        const quizId = buttonCode[1];
        const answer = buttonCode[2];
        const user_data = await spsheet.find({ uid: interaction.user.id, type: 'members' });
        if (!user_data) await interaction.reply({ embeds: [error_embed], flags: 'Ephemeral' });
        const allcount = user_data?.allcount || 0
        if (answer === 'answer') {
            const embed = new CustomEmbed()
                .setTitle('正答')
                .setDescription(`問題:${quiz[quizId].question}\n正答:${quiz[quizId]['choices' + quiz[quizId].answer]}\n総正答数:${user_data?.count || 0}`)
                .setColor(Colors.Green)
                .create();
            return await interaction.reply({ embeds: [embed], flags: 'Ephemeral' })
        }
        if (user_data?.mid == interaction.message.id) {
            const embed = new CustomEmbed()
                .setTitle('注意:すでに回答済みです')
                .setDescription(`問題:${quiz[quizId].question}\n正答:${quiz[quizId]['choices' + quiz[quizId].answer]}\n総正答数:${user_data?.count || 0}`)
                .setColor(Colors.Yellow)
                .create();
            return interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
        };
        if (quiz[quizId].answer == answer) {
            if (tokenrole) {
                tokenchannel.send(`${interaction.member}\nクイズ正解報酬<@${setting.bot.tokenbotid}>`)
            } else {
                pointchannel.send(`${interaction.member}\nクイズ正解報酬<@${setting.bot.pointbotid}>`)
            }
            if (user_data?.uid) {
                spsheet.update({ uid: interaction.user.id, allcount: Number(allcount) + 1, count: Number(user_data.count) + 1, type: 'members', mid: interaction.message.id })
            } else {
                spsheet.set({ uid: interaction.user.id, allcount: Number(allcount || 1), count: Number(user_data.count || 1), type: 'members', mid: interaction.message.id });
            };
            const embed = new CustomEmbed()
                .setTitle('✅正解')
                .setDescription(`問題:${quiz[quizId].question}\n回答:${quiz[quizId]['choices' + answer]}\n総正答数:${user_data?.count || 1}`)
                .setColor(Colors.Green)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
            const last_count = await spsheet.all({ type: 'system' });
            const last_content = await spsheet.find({ type: 'system', count: last_count.length });
            if (last_content) spsheet.update({ type: 'system', mid: interaction.message.id, answer_count: last_content.answer_count + 1, total_count: last_content.answer_count + 1 });
        } else {
            if (user_data?.uid) {
                spsheet.update({ uid: interaction.user.id, allcount: allcount + 1, count: user_data.count, type: 'members', mid: interaction.message.id })
            } else {
                spsheet.set({ uid: interaction.user.id, allcount: allcount + 1, count: 0, type: 'members', mid: interaction.message.id });
            };
            const embed = new CustomEmbed()
                .setTitle('✖不正解')
                .setDescription(`問題:${quiz[quizId].question}\n回答:${quiz[quizId]['choices' + answer]}\n正答:${quiz[quizId]['choices' + quiz[quizId].answer]}\n総正答数:${user_data?.count || 0}`)
                .setColor(Colors.Red)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
            const last_count = await spsheet.all({ type: 'system' });
            const last_content = await spsheet.find({ type: 'system', count: last_count.length });
            if (last_content) spsheet.update({ type: 'system', mid: interaction.message.id, total_count: last_content.answer_count + 1 });
        };
    }
};