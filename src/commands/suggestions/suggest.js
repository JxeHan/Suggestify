const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const generateId = require('../../utils/generateId');
const SuggestionChannel = require('../../schemas/suggestionSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Submit a suggestion')
        .addStringOption(option => 
            option.setName('suggestion')
                .setDescription('Content of suggestion')
                .setRequired(true)),
    async execute(interaction) {
        const suggestion = interaction.options.getString('suggestion');
        const suggestionChannelData = await SuggestionChannel.findOne({ guildId: interaction.guild.id });

        if (!suggestionChannelData) {
            return interaction.reply({ content: 'Suggestion channel has not been set up.', ephemeral: true });
        }

        const suggestionChannel = interaction.client.channels.cache.get(suggestionChannelData.channelId);
        if (!suggestionChannel) {
            return interaction.reply({ content: 'Suggestion channel not found.', ephemeral: true });
        }

        const suggestionId = generateId();
        const suggestionEmbed = new EmbedBuilder()
            .setDescription(suggestion)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setFooter({ text: `Suggestion ID: ${suggestionId} | Submitted at` })
            .setTimestamp();

        try {
            await suggestionChannel.send({ embeds: [suggestionEmbed] });
            const confirmationEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setDescription(`Your suggestion has been submitted! (ID: ${suggestionId})`);

            await interaction.reply({ embeds: [confirmationEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error sending suggestion:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('There was an error submitting your suggestion. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
