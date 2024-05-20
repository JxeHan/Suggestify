const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const SuggestionSettings = require('../../schemas/suggestionSchema');
const AnonymousSuggestionSettings = require('../../schemas/anonymousSuggestionSchema');
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
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Show current configuration settings')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Eemove configured settings')
                .addStringOption(option =>
                    option.setName('setting')
                        .setDescription('The setting to remove')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Channel', value: 'channel' },
                            { name: 'Role', value: 'mention' }
                        )
                )
                .addBooleanOption(option =>
                    option.setName('toggle')
                        .setDescription('Set to true to remove the setting, false to keep it')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable or disable suggestions')
                .addStringOption(option =>
                    option.setName('setting')
                        .setDescription('The setting to enable or remove')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Suggestions', value: 'normal' },
                            { name: 'Anonymous Suggestions', value: 'anonymous' }
                        )
                )
                .addBooleanOption(option =>
                    option.setName('toggle')
                        .setDescription('Set to true to enable, false to remove')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        try {
            const guildId = interaction.guild.id;

            if (interaction.options.getSubcommand() === 'config') {
                const channel = interaction.options.getChannel('channel');
                const role = interaction.options.getRole('mention');

                if (!channel.isTextBased()) {
                    return interaction.reply({ content: 'Please select a **text-based** channel.', ephemeral: true });
                }

                const updateData = { channelId: channel.id };
                if (role) {
                    updateData.roles = [role.id];
                }

                await SuggestionSettings.findOneAndUpdate(
                    { guildId },
                    { $set: updateData },
                    { upsert: true }
                );

                const embed = new EmbedBuilder()
                    .setTitle('<a:check_green:1240349082149715978> Suggestion Configuration Saved')
                    .addFields(
                        { name: 'Channel', value: channel ? `${channel}` : '<a:x_red:1240354262387654707>', inline: true },
                        { name: 'Mentions', value: role ? `${role}` : '<a:x_red:1240354262387654707>', inline: true }
                    )
                    .setColor(config.colour);

                return interaction.reply({ embeds: [embed] });

            } else if (interaction.options.getSubcommand() === 'info') {
                const settings = await SuggestionSettings.findOne({ guildId });
                const anonymousSettings = await AnonymousSuggestionSettings.findOne({ guildId });

                const channelValue = settings ? `<#${settings.channelId}>` : '<a:x_red:1240354262387654707>';
                const rolesValue = settings && settings.roles.length > 0
                    ? settings.roles.map(roleId => `<@&${roleId}>`).join(', ')
                    : '<a:x_red:1240354262387654707>';
                const anonymousValue = anonymousSettings && anonymousSettings.anonymousEnabled
                    ? '<:enabled:1240387020740624617> (enabled)'
                    : '<:disbaled:1240387309510332595> (disbaled)';
                const normalValue = settings && settings.suggestionsEnabled
                    ? '<:enabled:1240387020740624617> (enabled)'
                    : '<:disbaled:1240387309510332595> (disbaled)';

                const embed = new EmbedBuilder()
                    .setColor(config.colour)
                    .setTitle('<a:settings:1241714255984595036> Suggestion Information')
                    .addFields(
                        { name: 'Suggestion Channel', value: channelValue, inline: true },
                        { name: 'Suggestion Mentions', value: rolesValue, inline: true },
                        { name: 'Suggestions', value: normalValue, inline: false },
                        { name: 'Anonymous Suggestions', value: anonymousValue, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });

            } else if (interaction.options.getSubcommand() === 'remove') {
                const setting = interaction.options.getString('setting');
                const remove = interaction.options.getBoolean('toggle');

                if (setting === 'channel') {
                    if (remove) {
                        await SuggestionSettings.updateOne({ guildId }, { $unset: { channelId: "" } });
                    }
                    const embed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`<a:check_green:1240349082149715978> Successfully ${remove ? 'disbaled' : 'kept'} suggestion **channel** setting.`);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else if (setting === 'mention') {
                    if (remove) {
                        await SuggestionSettings.updateOne({ guildId }, { $set: { roles: [] } });
                    }
                    const embed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`<a:check_green:1240349082149715978> Successfully ${remove ? 'disbaled' : 'kept'} suggestion **mention** setting.`);

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            } else if (interaction.options.getSubcommand() === 'enable') {
                const setting = interaction.options.getString('setting');
                const enabled = interaction.options.getBoolean('toggle');

                if (setting === 'anonymous') {
                    await AnonymousSuggestionSettings.findOneAndUpdate(
                        { guildId },
                        { anonymousEnabled: enabled },
                        { upsert: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`${enabled ? '<:enabled:1240387020740624617> Anonymous suggestions **enabled**.' : '<:disbaled:1240387309510332595> Anonymous suggestions **disbaled**.'}`);

                    return interaction.reply({ embeds: [embed], ephemeral: true });
                } else if (setting === 'normal') {
                    await SuggestionSettings.findOneAndUpdate(
                        { guildId },
                        { suggestionsEnabled: enabled },
                        { upsert: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor(config.colour)
                        .setDescription(`${enabled ? '<:enabled:1240387020740624617> Suggestions **enabled**.' : '<:disbaled:1240387309510332595> Suggestions **disbaled**.'}`);

                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        } catch (error) {
            console.error('[SETTINGS:]', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colour)
                .setDescription('There was an error managing suggestion settings. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
