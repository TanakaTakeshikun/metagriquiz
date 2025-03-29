const { Guild, Channel, GuildMember, Snowflake, Message, CommandInteraction, Base } = require('discord.js');
const { LoggerChannel } = require('../Logger');

class CommandManager extends Base {
    /**
     * コマンドを管理するクラス
     * @param {Client} client - Discordのクライアント
     * @param {string} name - コマンド名
     * @param {string} [subcommand1] - サブコマンド (オプション)
     * @param {string} [subcommand2] - サブコマンド (オプション)
     */
    constructor(client, name, subcommand1, subcommand2) {
        super(client);
        this._baseCommand = client.commands.get(name);
        if (!this._baseCommand) return;

        const subcommandNames = [subcommand1, subcommand2];
        let subcommands = this._baseCommand.subcommands;

        if ('subcommandGroups' in this._baseCommand) {
            const parentGroup = this._baseCommand.subcommandGroups.get(subcommandNames[0]);
            if (parentGroup) {
                subcommandNames.shift();
                this._parentGroup = parentGroup;
                subcommands = parentGroup.subcommands;
            } else if (subcommands) {
                this._parentGroup = null;
            } else return;
        }

        if (subcommands) {
            this._command = subcommands.get(subcommandNames.shift());
            if (!this._command) return;
        } else {
            this._command = this._baseCommand;
        }

        /** @type {string} コマンドの名前 */
        this.name = this._command.name;

        /** @type {string} コマンドの説明 */
        this.description = this._command.description;

        /** @type {string} コマンドのカテゴリ */
        this.category = this._command.category;

        /** @type {function} コマンドの実行関数 */
        this.execute = this._command.execute;

        /** @type {function} オートコンプリートの関数 */
        this.autocomplete = this._command.autocomplete;

        /** @type {LoggerChannel} コマンドのロガー */
        this.logger = this._command.logger;
    }

    /** @type {Managers} コマンドの種類 (Managers.Message or Managers.Slash) */
    type = null;

    /** @type {Message|null} コマンドが実行されたメッセージ (メッセージコマンドのみ) */
    message = null;

    /** @type {CommandInteraction|null} コマンドが実行されたスラッシュインタラクション (スラッシュコマンドのみ) */
    interaction = null;

    /** @type {Snowflake} コマンドのID */
    id = null;

    /** @type {Guild|null} コマンドが実行されたギルド (ギルド内のみ) */
    guild = null;

    /** @type {Snowflake|null} コマンドが実行されたギルドのID (ギルド内のみ) */
    guildId = null;

    /** @type {Channel} コマンドが実行されたチャンネル */
    channel = null;

    /** @type {Snowflake} コマンドが実行されたチャンネルのID */
    channelId = null;

    /** @type {GuildMember|null} コマンドを実行したメンバー (ギルド内のみ) */
    member = null;

    /** @type {Date} コマンドが実行された日時 */
    createdAt = null;

    /** @type {number} コマンドが実行された時のタイムスタンプ */
    createdTimestamp = null;

    /** @type {string} コマンドのプレフィックス */
    prefix = '/';

    /** @type {CommandInteractionOptionResolver|null} コマンドの引数 (引数がない時はnull) */
    options = null;

    /**
     * コマンドに返信します。
     * ephemeralをnullにするとスラッシュコマンドの場合はtrueになり、メッセージコマンドの場合はそのまま返信します。
     * ephemeralをtrueにするとメッセージコマンドの場合はDMに内容を送信し、そのメッセージのURLを送信しそのメッセージを10秒後に削除します。
     * 
     * @param {string|MessagePayload|InteractionReplyOptions} options - 返信の内容
     * @returns {Promise<Message>|Promise<InteractionResponse>} 返信されたメッセージ
     */
    reply(options) { }

    /**
     * コマンドの実行結果を取得します。
     * @returns {Promise<Message>} コマンドの返信メッセージ
     */
    withResponse() { }

    /**
     * コマンドの返信を遅延させます。
     * @param {InteractionDeferReplyOptions} options - 遅延返信のオプション
     * @returns {Promise<InteractionResponse>} 遅延返信のレスポンス
     */
    deferReply(options) { }

}

module.exports = CommandManager;
