const { Colors } = require('discord.js');
const { CustomEmbed, SQLCommand } = require('../../libs');
const sql = new SQLCommand();
const setting = require('../../setting.json');

module.exports = {
  builder: (builder) => builder
    .setName('score')
    .setDescription('自身のスコアを表示')
  ,

  async execute(interaction) {
    const user_data = await sql.find({ uid: interaction.user.id, type: 'members' });
    const count = user_data?.count || 0;
    const allcount = user_data?.allcount || 0
    const embed = new CustomEmbed()
      .setTitle('あなたのスコア')
      .setDescription(`総正答数:${count}\n総回答数:${allcount}\n正答率:${parseFloat((count / allcount * 100).toFixed(2))}%\n最終回答:${new Date(user_data?.date).toLocaleString({ timeZone: setting.quiz.timeZone }) || "回答無"}`)
      .setColor(Colors.Green)
      .create();
    return await interaction.reply({ embeds: [embed], flags: 'Ephemeral' })
  }
}