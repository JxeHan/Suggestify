const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const SuggestionSettings = require('../../schemas/suggestionSchema');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDescription('Manage suggestion settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Sets the channel for suggestions')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send suggestions to')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles')
                .setDescription('Sets the roles to be mentioned for each suggestion')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to mention')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show current settings')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('role-remove')
                .setDescription('Remove a role from suggestion settings')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel-remove')
                .setDescription('Remove the suggestion channel')
        ),
    async execute(interaction) {
        try {
            if (interaction.options.getSubcommand() === 'channel') {
                const channel = interaction.options.getChannel('channel');
                if (!channel.isTextBased()) {
                    return interaction.reply({ content: 'Please select a text-based channel.', ephemeral: true });
                }

                await SuggestionSettings.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { channelId: channel.id },
                    { upsert: true }
                );

                const embed = new EmbedBuilder()
                    .setDescription(`:white_check_mark: Suggestions will be sent to ${channel}.`)
                    .setColor(config.HexColour);

                return interaction.reply({ embeds: [embed] });
            } else if (interaction.options.getSubcommand() === 'roles') {
                const role = interaction.options.getRole('role');

                await SuggestionSettings.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { $addToSet: { roles: role.id } }, // Using $addToSet to avoid duplicates
                    { upsert: true }
                );

                const embed = new EmbedBuilder()
                    .setDescription(`:white_check_mark: ${role} will be mentioned for each suggestion sent.`)
                    .setColor(config.HexColour);

                return interaction.reply({ embeds: [embed] });
            } else if (interaction.options.getSubcommand() === 'show') {
                const settings = await SuggestionSettings.findOne({ guildId: interaction.guild.id });
                
                const channelValue = settings ? `<#${settings.channelId}>` : ':x:';
                const rolesValue = settings && settings.roles.length > 0 ? settings.roles.map(roleId => `<@&${roleId}>`).join(', ') : ':x:';
                
                const embed = new EmbedBuilder()
                    .setColor(config.HexColour)
                    .setTitle('Suggestion Settings')
                    .addFields(
                        { name: 'Channel', value: channelValue },
                        { name: 'Roles', value: rolesValue }
                    );
                
                return interaction.reply({ embeds: [embed] });
            } else if (interaction.options.getSubcommand() === 'role-remove') {
                const roleToRemove = interaction.options.getRole('role');

                await SuggestionSettings.updateOne(
                    { guildId: interaction.guild.id },
                    { $pull: { roles: roleToRemove.id } }
                );

                return interaction.reply({ content: `:white_check_mark: Suggestion ping role removed.`, ephemeral: true });
            } else if (interaction.options.getSubcommand() === 'channel-remove') {
                await SuggestionSettings.deleteOne({ guildId: interaction.guild.id });

                return interaction.reply({ content: `:white_check_mark: Suggestion channel removed.`, ephemeral: true });
            }
        } catch (error) {
            console.error('Error managing suggestion settings:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.HexColour)
                .setDescription('There was an error managing suggestion settings. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
