const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submit your feedback'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('feedbackModal')
            .setTitle('Submit Feedback');

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedbackInput')
            .setLabel('Your Feedback')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Enter your feedback here...')
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(feedbackInput);

        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    },
};

