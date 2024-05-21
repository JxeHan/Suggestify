const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
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
                .setTitle(':book: Help Menu (1/6)')
                .setDescription('To get started, please go through each page showing you how to setup **Suggestify**.\nThanks for using **Suggestify**.')
                .addFields(
                    { name: 'Additional Information', value: 'Required arguments are surrounded by `[brackets]`, optional arguments are surrounded by `(parenthesis)`.' },
                    { name: 'Useful Links', value: '[Support](https://discord.gg/dKgrYcEx)\n[Invite Suggestify](https://discord.com/oauth2/authorize?client_id=1241540257162203158)' },
                ),
            new EmbedBuilder()
                .setColor(config.colour)
                .setTitle('<:enabled:1240387020740624617> Enabling Suggestions (2/6)')
                .setDescription('Firstly, we need to be able to use the suggest command, so we need to make sure we enable it.')
                .addFields(
                    { name: 'Usage', value: '`/suggestion enable` `[suggestions]` `[true]`', inline: true },
                    { name: 'Permissions', value: '`Manage Server`', inline: true }
                ),
            new EmbedBuilder()
                .setColor(config.colour)
                .setTitle('<:anonymous:1241909302948659200> <:enabled:1240387020740624617> Enabling Anonymous Suggestions (3/6)')
                .setDescription('Instead of just having normal suggestions, you can also have the ability to send suggestions anonymously without anyone knowing who sent the suggestion.\n\n**Note:** *This isn\'t a needed option*')
                .addFields(
                    { name: 'Usage', value: '`/suggestion enable` `(anonymous suggestions)` `[true]`', inline: true },
                    { name: 'Permissions', value: '`Manage Server`', inline: true }
                ),
            new EmbedBuilder()
                .setColor(config.colour)
                .setTitle('<:text_channel:1241725240330027152> Channel Configuration (4/6)')
                .setDescription('Secondly, we need a suggestion channel for your suggestions to be sent to.')
                .addFields(
                    { name: 'Usage', value: '`/suggestion config` `[channel]`', inline: true },
                    { name: 'Permissions', value: '`Manage Server`', inline: true }
                ),
            new EmbedBuilder()
                .setColor(config.colour)
                .setTitle('<:roleicon:1241726675788632144> Role Configuration (5/6)')
                .setDescription('Thirdly, you can set up a role to be mentioned whenever a suggestion is sent to notify you.\n\n**Note:** *This isn\'t a needed option*')
                .addFields(
                    { name: 'Usage', value: '`/suggestion config` `(mention)`', inline: true },
                    { name: 'Permissions', value: '`Manage Server`', inline: true }
                ),
            new EmbedBuilder()
                .setColor(config.colour)
                .setTitle('<:info:1241830776845369540> Configuration Information (6/6)')
                .setDescription('After you have set up your config you will then be able to showcase your config, this is so you can then make any changes to your previous configuration.')
                .addFields(
                    { name: 'Usage', value: '`/suggestion info`', inline: true },
                    { name: 'Permissions', value: '`Manage Server`', inline: true }
                ),
        ];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category_select')
            .setPlaceholder('Select a category')
            .addOptions([
                { label: 'Enabling Suggestions', value: '1' },
                { label: 'Enabling Anonymous Suggestions', value: '2' },
                { label: 'Channel Configuration', value: '3' },
                { label: 'Role Configuration', value: '4' },
                { label: 'Configuration Information', value: '5' },
            ]);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        await interaction.reply({ embeds: [pages[0]], components: [row] });

        const filter = i => i.customId === 'help_category_select' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            const selectedPage = parseInt(i.values[0], 10);
            await i.update({ embeds: [pages[selectedPage]], components: [row] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ components: [] });
            }
        });
    }
};
