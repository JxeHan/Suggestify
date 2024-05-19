const fs = require('fs');
const config = require('../../config');

function loadCommands(client) {
    const commandsArray = [];
    const developerArray = [];

    const commandsFolder = fs.readdirSync('./src/commands');
    for (const folder of commandsFolder) {
        const commandFiles = fs
            .readdirSync(`./src/commands/${folder}`)
            .filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const commandFile = require(`../commands/${folder}/${file}`);
            client.commands.set(commandFile.data.name, Object.assign(commandFile, { folder }));
            if (commandFile.developer) developerArray.push(commandFile.data.toJSON());
            else commandsArray.push(commandFile.data.toJSON());
            console.log('[Commands]'.brightBlue, `${file.split('.')[0]} has been loaded.`);
        }
    }

    client.application.commands.set(commandsArray);
    const developerGuild = client.guilds.cache.get(config.devguild);
    developerGuild.commands.set(developerArray);
}

module.exports = { loadCommands };
