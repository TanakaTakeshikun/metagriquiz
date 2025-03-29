const fs = require('node:fs');
const path = require('node:path');
const logger = require('../helpers/getLogger');

function EventHandler(client, eventsPath) {
    const Log = logger.createChannel('event');
    Log.info('Loading events...');
    const events = [];
    const eventsMap = new Map();

    fs.readdirSync(eventsPath).forEach((dir) => {
        Log.debug(`Loading category: ${dir}`);
        const eventsLog = Log.createChild(dir);
        const eventPath = path.resolve(eventsPath, dir);
        const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            eventsLog.debug(`Loading event: ${file}`);
            const event = require(path.resolve(eventPath, file));
            event.logger = eventsLog.createChild(file);
            events.push(event);

            if (eventsMap.has(event.name)) {
                eventsMap.get(event.name).push(event);
            } else {
                eventsMap.set(event.name, [event]);
            }
            Log.debug(`Registered event: ${event.name} (${file})`);
        }
        Log.debug(`Loaded ${eventFiles.length} events from ${dir}`);
    });

    eventsMap.forEach((events, eventName) => {
        client.on(eventName, async (...args) => {
            try {
                await Promise.all(
                    events
                        .filter(event => event.filter ? event.filter(...args) : true)
                        .map(async (event) => {
                            try {
                                await event.execute(...args, event.logger);
                            } catch (error) {
                                event.logger.error(`Error in event ${eventName}:`, error);
                            }
                        })
                );
            } catch (error) {
                Log.error(`Unhandled error in event ${eventName}:`, error);
            }
        });
    });

    Log.info(`Successfully loaded ${events.length} events.`);
    return events;
}

module.exports = EventHandler;
