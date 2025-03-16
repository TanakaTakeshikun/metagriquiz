const { Events, Colors } = require("discord.js");
const quiz = require("../../quiz.json");
const { CustomEmbed } = require("../../libs");

module.exports = {
    name: Events.InteractionCreate,
    filter: (i) => i.isButton() && i.customId.startsWith("quiz_"),
    async execute(interaction) {
        const buttonCode = interaction.customId.split("_")
        const quizId = buttonCode[1]
        const answer = buttonCode[2]
        if (quiz[quizId].answer == answer) {
            const embed = new CustomEmbed()
                .setTitle("✅正解")
                .setDescription(`解説:${quiz[quizId].explanation}`)
                .setColor(Colors.Green)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' })
        } else {
            const embed = new CustomEmbed()
                .setTitle("✖不正解")
                .setDescription(`正解:${quiz[quizId].answer}\n解説:${quiz[quizId].explanation}`)
                .setColor(Colors.Red)
                .create();
            interaction.reply({ embeds: [embed], flags: 'Ephemeral' })
        };
    }
};