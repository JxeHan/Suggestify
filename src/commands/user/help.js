const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('A command meant to help you out'),

    async execute(interaction) {
        await interaction.reply('Hello World');
    }
};
