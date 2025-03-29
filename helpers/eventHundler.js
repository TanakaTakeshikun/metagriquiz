const fs = require('node:fs');
const path = require('node:path');
const logger = require('../helpers/getLogger');

/**
 * 指定されたディレクトリからイベントを読み込み、Discordクライアントに適用する関数
 * @param {import('discord.js').Client} client - Discordクライアント
 * @param {string} eventsPath - イベントディレクトリのパス
 * @returns {Array<Object>} 読み込まれたイベントオブジェクトの配列
 */
function EventHandler(client, eventsPath) {
    const Log = logger.createChannel('event');
    Log.info('Loading events...');

    const events = [];
    const eventsMap = new Map();

    // イベントフォルダを読み込み
    fs.readdirSync(eventsPath).forEach((dir) => {
        Log.debug(`Loading ${dir}...`);
        const eventsLog = Log.createChild(dir);
        const eventPath = path.resolve(eventsPath, dir);
        const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            eventsLog.debug(`Loading ${dir} ${file}...`);
            const eventFilePath = path.resolve(eventPath, file);

            try {
                const event = require(eventFilePath);
                event.logger = eventsLog.createChild(file);
                events.push(event);

                const eventList = eventsMap.get(event.name) || [];
                eventList.push(event);
                eventsMap.set(event.name, eventList);

                Log.debug(`Loaded ${dir} ${event.name} (${file})`);
            } catch (error) {
                Log.error(`Failed to load ${dir}/${file}: ${error.message}`);
            }
        }
        Log.debug(`Loaded ${eventFiles.length} events for ${dir}`);
    });

    // イベントをDiscordクライアントに登録
    eventsMap.forEach((eventList, eventName) => {
        client.on(eventName, async (...args) => {
            for (const event of eventList) {
                if (event.filter && !event.filter(...args)) continue;

                try {
                    await event.execute(...args, event.logger);
                } catch (error) {
                    event.logger.error(error);
                }
            }
        });
    });

    Log.info(`Loaded ${events.length} events`);
    return events;
}

module.exports = EventHandler;
