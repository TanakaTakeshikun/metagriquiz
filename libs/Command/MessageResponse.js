const { DiscordSnowflake } = require('@sapphire/snowflake');
const { InteractionCollector } = require('discord.js');

/**
 * メッセージレスポンスを表すクラス
 * @class
 */
class MessageResponse {
    /**
     * @param {import('discord.js').Message} message - 対応するメッセージ
     * @param {import('discord.js').Snowflake} [id] - レスポンスのID (省略時は `message.id`)
     */
    constructor(message, id) {
        /**
         * レスポンスに関連するメッセージ
         * @type {import('discord.js').Message}
         */
        this.message = message;

        /**
         * レスポンスのID
         * @type {import('discord.js').Snowflake}
         */
        this.id = id ?? message.id;

        /**
         * クライアントインスタンス
         * @type {import('discord.js').Client}
         */
        this.client = message.client;
    }

    /**
     * レスポンスが作成されたタイムスタンプ (ミリ秒)
     * @type {number}
     * @readonly
     */
    get createdTimestamp() {
        return DiscordSnowflake.timestampFrom(this.id);
    }

    /**
     * レスポンスが作成された日時
     * @type {Date}
     * @readonly
     */
    get createdAt() {
        return new Date(this.createdTimestamp);
    }

    /**
     * 指定したフィルターに一致するコンポーネントのインタラクションを1つ待機します。
     * 指定した時間が経過すると `Promise` は拒否されます。
     * @param {import('discord.js').AwaitMessageComponentOptions} [options={}] - コレクターのオプション
     * @returns {Promise<import('discord.js').MessageComponentInteraction>}
     */
    awaitMessageComponent(options = {}) {
        return this.message.awaitMessageComponent(options);
    }

    /**
     * メッセージコンポーネントのインタラクションを収集するコレクターを作成します。
     * @param {import('discord.js').MessageComponentCollectorOptions} [options={}] - コレクターのオプション
     * @returns {InteractionCollector}
     */
    createMessageComponentCollector(options) {
        return this.message.createMessageComponentCollector(options);
    }

    /**
     * メッセージレスポンスを取得します。
     * @returns {Promise<import('discord.js').Message>}
     */
    fetch() {
        return Promise.resolve(this.message);
    }

    /**
     * レスポンスを削除します。
     * @returns {Promise<void>}
     */
    delete() {
        return this.message.delete();
    }

    /**
     * レスポンスを編集します。
     * @param {string | import('discord.js').MessagePayload | import('discord.js').WebhookMessageEditOptions} options - 新しいメッセージ内容
     * @returns {Promise<import('discord.js').Message>}
     */
    edit(options) {
        return this.message.edit(options);
    }
}

module.exports = MessageResponse;
