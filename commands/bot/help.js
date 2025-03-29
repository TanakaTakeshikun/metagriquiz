const { Colors } = require('discord.js');
const { CustomEmbed } = require('../../libs');

/**
 * ヘルプコマンドの設定と実行を担当するモジュール。
 * コマンド名の引数が渡されると、そのコマンドの詳細を表示します。
 * 引数がない場合、すべてのコマンドをカテゴリごとにリスト表示します。
 * 
 * @module help
 */
module.exports = {
  /**
   * コマンドのビルダー。
   * ヘルプコマンドを作成し、オプションとしてコマンド名を受け取るオプションを追加します。
   * 
   * @param {import('discord.js').SlashCommandBuilder} builder - コマンドビルダー
   * @returns {import('discord.js').SlashCommandBuilder} ビルダーに設定を追加したコマンドオブジェクト
   */
  builder: (builder) => builder
    .setName('help')
    .setDescription('ヘルプの表示')
    .addStringOption(option => option
      .setName('commandname')
      .setDescription('指定されたコマンドの詳細を表示します。')
    ),

  /**
   * ヘルプコマンドの実行処理。
   * コマンド名が指定されていない場合は、カテゴリごとにコマンドをリスト表示します。
   * コマンド名が指定された場合、そのコマンドの詳細を表示します。
   * 
   * @param {import('discord.js').CommandInteraction} command - コマンドインタラクションオブジェクト
   * @returns {Promise<void>}
   */
  execute(command) {
    const { commands } = command.client;
    const commandName = command.options.getString('commandname');

    // コマンド名が指定されていない場合、カテゴリ別のコマンドリストを表示
    if (!commandName) {
      const categoryCommands = {};

      // 登録されているすべてのコマンドをカテゴリごとにグループ化
      commands.forEach((cmd) => {
        if (!categoryCommands[cmd.category]) {
          categoryCommands[cmd.category] = [];
        }
        const commandList = [`\`/${cmd.name}\` - ${cmd.description}`];

        // サブコマンドが存在する場合、そのサブコマンドもリストに追加
        if ('subcommands' in cmd) {
          cmd.subcommands.forEach((subcommand) => {
            commandList.push(`> \`${command.prefix}${cmd.name} ${subcommand.name}\` - ${subcommand.description}`);
          });
        }
        categoryCommands[cmd.category].push(commandList);
      });

      // フィールドを生成してエンベッドに追加
      const fields = Object.entries(categoryCommands).map(data => {
        return { name: data[0], value: data[1][0][0] };
      });

      const embed = new CustomEmbed()
        .setTitle('help')
        .setColor('#fb644c')
        .addFields(fields)
        .create();

      // ヘルプ情報を返す
      console.log(embed);
      command.reply({ embeds: [embed], flags: 'Ephemeral' });
    } else {
      // 指定されたコマンド名に一致するコマンドを検索
      const showCommand = commands.find((cmd) => cmd.name === commandName);

      // コマンドが見つからなければエラーメッセージを返す
      if (!showCommand) return command.reply({ content: `'${commandName}'というコマンドが見つかりませんでした。`, flags: 'Ephemeral' });

      // コマンドの詳細をエンベッドに設定
      const embed = new CustomEmbed()
        .setTitle(`${showCommand.prefix}${commandName} の詳細`)
        .setColor(Colors.Orange)
        .setFields(
          {
            name: '説明',
            value: showCommand.description
          },
        );

      // 詳細情報を返す
      command.reply({ embeds: [embed], flags: 'Ephemeral' });
    }
  }
}
