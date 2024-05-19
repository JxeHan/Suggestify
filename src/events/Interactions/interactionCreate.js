const { WebhookClient, EmbedBuilder, Collection } = require("discord.js");
const config = require('../../../config');
const dayjs = require('dayjs');

// Initialize a Collection to store cooldowns of commands
const cooldowns = new Collection();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client, channel) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Check if the cooldowns Collection already has an entry for the command
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);

        // Check if the command has a cooldown property defined
        if (command.cooldown !== undefined) {
            const cooldownAmount = command.cooldown * 1000; // Convert cooldown to milliseconds

            // Check if the user has already used this command within the cooldown period
            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
                if (now < expirationTime) {
                    return interaction.reply({ content: `Please wait, you are on a cooldown for \`/${command.data.name}\`. You can use it again <t:${Math.round(expirationTime / 1000)}:R>.`, ephemeral: true });
                }
            }

            // Set cooldown timestamp for the user
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }

        try {
            // Check if the command is for developers only
            if (command.developer) {
                // If the user is not in the developer list, do not execute the command
                if (!config.developer || !config.developer.includes(interaction.user.id)) {
                    return interaction.reply({ content: config.developerOnlyReply, ephemeral: true });
                }
            }

            await command.execute(interaction, client, channel);
        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: config.interactionErrorReply,
                ephemeral: true
            });

            const webhookClient = new WebhookClient({ url: config.errorWebhookUrl });
            const embed = new EmbedBuilder()
                .setTitle('Error Occurred')
                .addFields(
                   { name: 'User', value: `<@${interaction.user.id}>`, inline: true},
                   { name: 'Command', value: `\`/${command.data.name}\``, inline: true },
                   { name: 'Error', value: `\`\`\`${error}\`\`\``, inline: false }
                )
                .setColor("Red")
                .setFooter({ 
                    text: `${dayjs().format('DD-MM-YYYY - HH:mm:ss')}` });

            await webhookClient.send({
                embeds: [embed]
            });
        }
    }
};
