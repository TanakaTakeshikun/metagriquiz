const { time } = require('discord.js');

/**
 * Discord タイムスタンプをフォーマットする関数
 * @param {number} timestamp - ミリ秒単位の Unix タイムスタンプ
 * @param {string} [format='F'] - フォーマットオプション（例: 't', 'T', 'd', 'D', 'f', 'F', 'R'）
 * @returns {string} Discord 形式のタイムスタンプ文字列
 * @throws {TypeError} timestamp が無効な場合にエラーをスロー
 */
function ts2time(timestamp, format = 'F') {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
        throw new TypeError('Invalid timestamp: Expected a number.');
    }
    return time((timestamp / 1000) | 0, format);
}

module.exports = ts2time;
