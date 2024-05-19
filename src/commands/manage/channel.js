const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SuggestionChannel = require('../../schemas/suggestionSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Sets the channel for suggestions')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to send suggestions to')
                .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel.isTextBased()) {
            return interaction.reply({ content: 'Please select a text-based channel.', ephemeral: true });
        }

        await SuggestionChannel.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { channelId: channel.id },
            { upsert: true }
        );

        const embed = new EmbedBuilder()
            .setDescription(`Suggestions will be sent to ${channel}`);

        interaction.reply({ embeds: [embed] });
    },
};
