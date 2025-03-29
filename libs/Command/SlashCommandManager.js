const Managers = require('./Managers');
const CommandManager = require('./CommandManager');

/**
 * スラッシュコマンドを管理するクラス
 * @class
 * @extends CommandManager
 */
class SlashCommandManager extends CommandManager {
    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction - スラッシュコマンドのインタラクション
     */
    constructor(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);
        if (subcommandGroup) {
            super(interaction.client, interaction.commandName, subcommandGroup, subcommand);
        } else {
            super(interaction.client, interaction.commandName, subcommand);
        }
        if (!this.name) return;

        /**
         * コマンドのオプション
         * @type {import('discord.js').CommandInteractionOptionResolver}
         */
        this.options = interaction.options;

        /**
         * スラッシュコマンドのインタラクション
         * @type {import('discord.js').ChatInputCommandInteraction}
         */
        this.interaction = interaction;

        /**
         * コマンドのID
         * @type {import('discord.js').Snowflake}
         */
        this.id = interaction.id;

        /**
         * コマンドを実行したユーザー
         * @type {import('discord.js').User}
         */
        this.author = interaction.user;

        /**
         * コマンドが実行されたチャンネル
         * @type {import('discord.js').TextChannel | import('discord.js').DMChannel | import('discord.js').ThreadChannel}
         */
        this.channel = interaction.channel;

        /**
         * コマンドが実行されたチャンネルのID
         * @type {import('discord.js').Snowflake}
         */
        this.channelId = interaction.channelId;

        /**
         * コマンドが実行された日時
         * @type {Date}
         */
        this.createdAt = interaction.createdAt;

        /**
         * コマンドが実行された時のタイムスタンプ (ミリ秒)
         * @type {number}
         */
        this.createdTimestamp = interaction.createdTimestamp;

        if (interaction.guild) {
            /**
             * コマンドが実行されたギルド (サーバー)
             * @type {import('discord.js').Guild | null}
             */
            this.guild = interaction.guild;

            /**
             * コマンドが実行されたギルドのID
             * @type {import('discord.js').Snowflake | null}
             */
            this.guildId = interaction.guildId;

            /**
             * コマンドを実行したメンバー
             * @type {import('discord.js').GuildMember | null}
             */
            this.member = interaction.member;
        }
    }

    /**
     * コマンドの種類 (スラッシュコマンド)
     * @type {string}
     */
    type = Managers.Slash;

    /**
     * コマンドのレスポンスを送信します。
     * @param {string | import('discord.js').InteractionReplyOptions} options - 返信の内容
     * @returns {Promise<import('discord.js').Message | import('discord.js').InteractionResponse>}
     */
    reply(options) {
        if (typeof options !== 'string' && options.ephemeral === null) {
            return this.interaction.reply({ ...options, ephemeral: true });
        } else {
            return this.interaction.reply(options);
        }
    }

    /**
     * コマンドのレスポンスを取得します。
     * @returns {Promise<import('discord.js').Message>}
     */
    withResponse() {
        return this.interaction.withResponse();
    }

    /**
     * コマンドのレスポンスを遅延させます。
     * @param {import('discord.js').InteractionDeferReplyOptions} options - 遅延返信のオプション
     * @returns {Promise<import('discord.js').Message | import('discord.js').InteractionResponse>}
     */
    deferReply(options) {
        if (typeof options !== 'string' && options.ephemeral === null) {
            return this.interaction.deferReply({ ...options, ephemeral: true });
        } else {
            return this.interaction.deferReply(options);
        }
    }
}

module.exports = SlashCommandManager;
