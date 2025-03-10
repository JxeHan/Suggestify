const fs = require('fs');
const colors = require('@colors/colors');

function loadEvents(client) {
    const folders = fs.readdirSync('./src/events');

    for (const folder of folders) {
        const files = fs
            .readdirSync(`./src/events/${folder}`)
            .filter((file) => file.endsWith('.js'));

        for (const file of files) {
            const event = require(`../events/${folder}/${file}`);

            if (event.rest) {
                if (event.once)
                    client.rest.once(event.name, (...args) => event.execute(...args, client));
                else
                    client.rest.on(event.name, (...args) => event.execute(...args, client));
            } else {
                if (event.once)
                    client.once(event.name, (...args) => event.execute(...args, client));
                else
                    client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log('[Events]'.brightYellow, `${file.split('.')[0]} has been loaded.`);
        }
    }
}

module.exports = { loadEvents };
