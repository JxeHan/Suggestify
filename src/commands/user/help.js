const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { sendPagination } = require('../../utils/pagination'); // Ensure correct path
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Use to get started'),

    async execute(interaction) {
        const pages = [
            new EmbedBuilder()
                .setColor(config.colour)
                .setTitle(':book: Help Menu (1/4)')
                .setDescription('To get started, please go through each page showing you how to setup **Suggestify**.\nThanks for using **Suggestify**.')
                .addFields(
                    { name: 'Useful Links', value: '[Support](https://discord.gg/dKgrYcEx)\n[Invite Suggestify](https://discord.com/oauth2/authorize?client_id=1241540257162203158)', inline: true },
                ),
            new EmbedBuilder()
                .setColor(config.colour)
                .setTitle('<:text_channel:1241725240330027152> Channel Configuration (2/4)')
                .setDescription('Firstly, we need a suggestion channel for your suggestions to be sent too.')
                .addFields(
                    { name: 'Usage', value: '`/suggestion config` `[channel]`', inline: true },
                    { name: 'Permissions', value: '`Manage Server`', inline: true }
                ),
            new EmbedBuilder() 
                .setColor(config.colour)
                .setTitle('<:roleicon:1241726675788632144> Role Configuration (3/4)')
                .setDescription('Secondly, you can setup a role to be mentioned whenever a suggestion is sent to notify you.\n\n*You don\'t need to have this setup*')
                .addFields(
                    { name: 'Usage', value: '`/suggestion config` `(role)`', inline: true },
                    { name: 'Permissions', value: '`Manage Server`', inline: true }
                ),
            new EmbedBuilder()
            .setColor(config.colour)
            .setTitle('<:info:1241830776845369540> Configuration Information (4/4)')
            .setDescription('After you have setup your config you will then be able to showcase your config, this is so you can then make any changes to your previous configuration.')
            .addFields(
                { name: 'Usage', value: '`/suggestion info`', inline: true },
                { name: 'Permissions', value: '`Manage Server`', inline: true }
            ),
        ];

        await sendPagination(interaction, pages);
    }
};
