const chalk = require('chalk');
const { Logger } = require('../libs');
const logQueue = ['接続しました。'];
const MAX_LOG_QUEUE_SIZE = 100; // ログ履歴の最大サイズ

const logger = new Logger({
    levels: ['info', 'warn', 'error', 'debug'],
    writeLog(data) {
        let { lines, level: _level, time, location } = data;

        // エラーメッセージの整形
        const errors = lines.filter(line => line instanceof Error);
        if (errors.length > 0) {
            lines = errors.map(error => `\n[ERROR] ${error.message}\n${error.stack}`);
        }

        // ログフォーマット
        let levelTag = `[${_level.toUpperCase()}]`;
        const formattedLog = `[${time}][${location.join('][')}] ${levelTag} ${lines}`;

        // メモリ管理: 最大サイズを超えたら古いログを削除
        logQueue.push(formattedLog);
        if (logQueue.length > MAX_LOG_QUEUE_SIZE) logQueue.shift();

        // ログレベルに応じて色付け
        switch (_level) {
            case 'info':
                levelTag = chalk.cyan(levelTag);
                break;
            case 'warn':
                levelTag = chalk.magenta(levelTag);
                break;
            case 'error':
                levelTag = chalk.red(levelTag);
                break;
            case 'debug':
                levelTag = chalk.yellow(levelTag);
                break;
        }

        // コンソール出力
        console.log(`[${time}][${location.join('][')}] ${levelTag} ${lines}`);
    }
});

module.exports = logger;
