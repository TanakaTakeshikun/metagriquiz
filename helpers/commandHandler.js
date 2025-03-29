const { CustomEmbed, Command } = require('../libs');

/**
 * コマンドを実行し、エラーが発生した場合に適切な処理を行う関数
 * 
 * @async
 * @param {Object} command - 実行するコマンドオブジェクト
 * @returns {Promise<void>}
 */
async function commandHandler(command) {
    try {
        await command.execute();
    } catch (error) {
        command.logger.error(error);

        // エラー応答用のEmbed作成
        const embed = new CustomEmbed('error').typeError();

        switch (error.message) {
            case 'Missing Permissions':
                embed.setDescription('権限が足りません。\nBOTに権限を与えてください');
                break;
            default:
                embed.setDescription(`不明なエラーが発生しました。\n詳細: ${error.message}\n運営に問い合わせていただけると幸いです。`);
        }

        // メッセージタイプに応じた返信処理
        const replyOptions = { embeds: [embed] };
        if (command.type !== Command.Managers.Message) {
            replyOptions.ephemeral = true;
        }

        command.reply(replyOptions).catch(() => { });
    }
}

module.exports = commandHandler;
