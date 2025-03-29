/**
 * コマンドの種類を定義するオブジェクト
 * @enum {string}
 */
const Managers = {
    /** スラッシュコマンドを管理するマネージャー */
    Slash: 'SlashManager',

    /** メッセージコマンドを管理するマネージャー */
    Message: 'MessageManager'
};

module.exports = Managers;
