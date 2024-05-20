const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SuggestionSchema = require('../../schemas/suggestionSchema');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a suggestion by ID')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the suggestion to search for')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const suggestionId = interaction.options.getString('suggestion_id');

            // Find the suggestion in the database
            const suggestion = await SuggestionSchema.findOne({ suggestionIds: suggestionId });

            if (!suggestion) {
                return interaction.reply({ content: '<a:x_red:1240354262387654707> Suggestion not found.', ephemeral: true });
            }

            // Check if all properties exist and have valid values
            if (!suggestion.content || !suggestion.submittedBy || !suggestion.timestamp) {
                return interaction.reply({ content: '<a:x_red:1240354262387654707> Invalid suggestion details.', ephemeral: true });
            }

            // Construct and send the embed with suggestion details
            const embed = new EmbedBuilder()
                .setColor(config.colour)
                .setTitle(`Suggestion Details (${suggestionId})`)
                .setDescription(`ID: \`${suggestionId}\`\nAuthor: <@${suggestion.submittedBy}>\nTimestamp: ${suggestion.timestamp.toLocaleString()}`)
                .addFields(
                    { name: 'Content', value: `\`\`\`${suggestion.content}\`\`\``, inline: true },
                )
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('[SEARCH COMMAND]', error);
            await interaction.reply({ content: 'An error occurred while searching for the suggestion.', ephemeral: true });
        }
    },
};
