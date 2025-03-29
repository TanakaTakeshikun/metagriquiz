const { Events, Colors } = require('discord.js');
const { CustomEmbed } = require('../../libs');

/**
 * 権限不足時に送信されるエラーメッセージの埋め込み。
 */
const permissions_embed = new CustomEmbed()
    .setTitle('⚠️エラー')
    .setDescription('権限が足りません。\nBOTに権限を与えてください')
    .setColor(Colors.Red)
    .create();

/**
 * インタラクション作成時のイベントハンドラー。
 * オートコンプリートとコマンド実行を処理する。
 * 
 * @module InteractionCreate
 */
module.exports = {
    name: Events.InteractionCreate,

    /**
     * インタラクションが発生したときに実行される関数。
     * 
     * @async
     * @param {import('discord.js').Interaction} interaction - Discordのインタラクションオブジェクト
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            // オートコンプリート処理
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        } else {
            // コマンド実行処理
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (err) {
                // 権限不足エラーの場合
                if (err.message === 'Missing Permissions') {
                    return await interaction.reply({ 
                        embeds: [permissions_embed], 
                        flags: 'Ephemeral' 
                    }).catch(() => { });
                }

                // その他のエラー処理
                console.error(err);
                const unknown_embed = new CustomEmbed()
                    .setTitle('⚠️エラー')
                    .setDescription(`不明なエラーが発生しました。\n詳細:${err.message}\n運営に問い合わせていただけると幸いです。`)
                    .setColor(Colors.Red)
                    .create();

                await interaction?.reply({ 
                    embeds: [unknown_embed], 
                    flags: 'Ephemeral' 
                }).catch(() => { });
            }
        }
    }
};
