const { Events, Colors } = require('discord.js');
const quiz = require('../../quiz.json');
const { CustomEmbed, SQLCommand } = require('../../libs');
const sql = new SQLCommand();

module.exports = {
    name: Events.InteractionCreate,
    filter: (i) => i.isButton() && i.customId.startsWith('quiz_'),
    async execute(interaction) {
        const buttonCode = interaction.customId.split('_');
        const quizId = buttonCode[1];
        const answer = buttonCode[2];
        const user_data = await sql.find({ uid: interaction.user.id, type: 'members' });
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
            if (user_data?.uid) {
                sql.update({ uid: interaction.user.id, allcount: allcount + 1, count: user_data.count + 1, type: 'members', mid: interaction.message.id })
            } else {
                sql.set({ uid: interaction.user.id, allcount: allcount + 1, count: 1, type: 'members', mid: interaction.message.id });
            };
            const embed = new CustomEmbed()
                .setTitle('✅正解')
                .setDescription(`問題:${quiz[quizId].question}\n回答:${quiz[quizId]['choices' + answer]}\n総正答数:${user_data?.count || 1}`)
                .setColor(Colors.Green)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
        } else {
            if (user_data?.uid) {
                sql.update({ uid: interaction.user.id, allcount: allcount + 1, count: user_data.count, type: 'members', mid: interaction.message.id })
            } else {
                sql.set({ uid: interaction.user.id, allcount: allcount + 1, count: 0, type: 'members', mid: interaction.message.id });
            };
            const embed = new CustomEmbed()
                .setTitle('✖不正解')
                .setDescription(`問題:${quiz[quizId].question}\n回答:${quiz[quizId]['choices' + answer]}\n正答:${quiz[quizId]['choices' + quiz[quizId].answer]}\n総正答数:${user_data?.count || 0}`)
                .setColor(Colors.Red)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' })
        };
    }
};