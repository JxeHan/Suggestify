const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const SuggestionSettings = require('../../schemas/suggestionSchema');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDescription('Manage suggestion settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configure suggestion settings')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send suggestions to')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('mention')
                        .setDescription('The role to mention for each suggestion')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Show current configuration settings')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('erase')
                .setDescription('Erase configured settings')
                .addStringOption(option =>
                    option.setName('setting')
                        .setDescription('The setting to erase')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Channel', value: 'channel' },
                            { name: 'Role', value: 'mention' }
                        )
                    )                        
                .addBooleanOption(option =>
                    option.setName('remove')
                        .setDescription('Set to true to remove the setting, false to keep it')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        try {
            if (interaction.options.getSubcommand() === 'config') {
                const channel = interaction.options.getChannel('channel');
                const role = interaction.options.getRole('mention');

                if (!channel.isTextBased()) {
                    return interaction.reply({ content: 'Please select a text-based channel.', ephemeral: true });
                }

                await SuggestionSettings.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { channelId: channel.id, $addToSet: { roles: role.id } }, // Using $addToSet to avoid duplicates
                    { upsert: true }
                );

                const embed = new EmbedBuilder()
                    .setTitle('<a:check_green:1240349082149715978> Suggestion Configuration Saved')
                    .addFields(
                        { name: 'Channel', value: `${channel}`, inline: true },
                        { name: 'Roles', value: `${role}`, inline: true }
                    )
                    .setColor(config.colour);

                return interaction.reply({ embeds: [embed] });
            } else if (interaction.options.getSubcommand() === 'info') {
                const settings = await SuggestionSettings.findOne({ guildId: interaction.guild.id });

                const channelValue = settings ? `<#${settings.channelId}>` : '<a:x_red:1240354262387654707>';
                const rolesValue = settings && settings.roles.length > 0 ? settings.roles.map(roleId => `<@&${roleId}>`).join(', ') : '<a:x_red:1240354262387654707>';

                const embed = new EmbedBuilder()
                    .setColor(config.colour)
                    .setTitle('<a:settings:1241714255984595036> Suggestion Information')
                    .addFields(
                        { name: 'Channel', value: channelValue, inline: true },
                        { name: 'Roles', value: rolesValue, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            } else if (interaction.options.getSubcommand() === 'erase') {
                const setting = interaction.options.getString('setting');
                const remove = interaction.options.getBoolean('remove');

                if (setting === 'channel') {
                    if (remove) {
                        await SuggestionSettings.findOneAndDelete({ guildId: interaction.guild.id });
                        const eraseEmbed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`<a:check_green:1240349082149715978> Successfully removed **${setting}**.`)
                        await interaction.reply({ embeds: [eraseEmbed], ephemeral: true });
                    } else {
                        const keptEmbed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`<a:check_green:1240349082149715978> Successfully kept **${setting}**.`)
                        await interaction.reply({ embeds: [keptEmbed],  ephemeral: true });
                    }
                } else if (setting === 'role') {
                    if (remove) {
                        await SuggestionSettings.findOneAndUpdate({ guildId: interaction.guild.id }, { roles: [] });
                        const eraseEmbed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`<a:check_green:1240349082149715978> Successfully removed **${setting}**.`)
                        await interaction.reply({ embeds: [eraseEmbed], ephemeral: true });
                    } else {
                        const kepttEmbed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`<a:check_green:1240349082149715978> Successfully kept **${setting}**.`)
                        await interaction.reply({ embeds: [kepttEmbed],  ephemeral: true });
                    }
                }
            }
        } catch (error) {
            console.error('Error managing suggestion settings:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colour)
                .setDescription('There was an error managing suggestion settings. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
