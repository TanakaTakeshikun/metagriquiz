const { Colors } = require('discord.js');
const { CustomEmbed } = require('../../libs');

module.exports = {
  builder: (builder) => builder
    .setName('help')
    .setDescription('ヘルプの表示')
    .addStringOption(option => option
      .setName('commandname')
      .setDescription('指定されたコマンドの詳細を表示します。')
    )
  ,

  execute(command) {
    const { commands } = command.client;
    const commandName = command.options.getString('commandname');
    if (!commandName) {
      const categoryCommands = {};
      commands.forEach((cmd) => {
        if (!categoryCommands[cmd.category]) {
          categoryCommands[cmd.category] = [];
        }
        const commandList = [`\`/${cmd.name}\` - ${cmd.description}`];
        if ('subcommands' in cmd) {
          cmd.subcommands.forEach((subcommand) => {
            commandList.push(`> \`${command.prefix}${cmd.name} ${subcommand.name}\` - ${subcommand.description}`);
          });
        }
        categoryCommands[cmd.category].push(commandList);
      });
      const fields = Object.entries(categoryCommands).map(data => { return { name: data[0], value: data[1][0][0] } });
      const embed = new CustomEmbed()
        .setTitle('help')
        .setColor('#fb644c')
        .addFields(fields)
        .create();
      console.log(embed)
      command.reply({ embeds: [embed], flags: 'Ephemeral' });
    } else {
      const showCommand = commands.find((cmd) => cmd.name === commandName);
      if (!showCommand) return command.reply({ content: `'${commandName}'というコマンドが見つかりませんでした。`, flags: 'Ephemeral' });
      const embed = new CustomEmbed()
        .setTitle(`${showCommand.prefix}${commandName} の詳細`)
        .setColor(Colors.Orange)
        .setFields(
          {
            name: '説明',
            value: showCommand.description
          },
        )
      command.reply({ embeds: [embed], flags: 'Ephemeral' })
    }
  }
}