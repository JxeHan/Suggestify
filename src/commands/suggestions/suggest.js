const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const generateId = require('../../utils/generateId');
const SuggestionChannel = require('../../schemas/suggestionSchema');
const config = require('../../../config');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Submit a suggestion')
        .addStringOption(option => 
            option.setName('suggestion')
                .setDescription('Content of suggestion')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const suggestion = interaction.options.getString('suggestion');
            const suggestionChannelData = await SuggestionChannel.findOne({ guildId: interaction.guild.id });

            if (!suggestionChannelData) {
                return interaction.reply({ content: ':x: Suggestion channel has not been set up.', ephemeral: true });
            }

            const suggestionChannel = interaction.client.channels.cache.get(suggestionChannelData.channelId);
            if (!suggestionChannel) {
                return interaction.reply({ content: ':warning: Suggestion channel not found.', ephemeral: true });
            }

            let rolesToMention = '';
            if (suggestionChannelData.roles && suggestionChannelData.roles.length > 0) {
                rolesToMention = suggestionChannelData.roles.map(roleId => `<@&${roleId}>`).join(' ');
            }

            const suggestionId = generateId();
            const suggestionEmbed = new EmbedBuilder()
                .setColor(config.HexColour)
                .setDescription(suggestion)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setAuthor({ name: `Suggestion from ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setFooter({ text: `Suggestion ID: ${suggestionId} | Submitted at` })
                .addFields(
                    { name: 'Votes', value: `Upvotes: \`0\`\nDownVotes: \`0\`` }, // vote tracking still needs fixing
                )     
                .setTimestamp();
                
            const suggestionMessage = await suggestionChannel.send({ content: rolesToMention, embeds: [suggestionEmbed] });

            await suggestionMessage.react('👍');
            await suggestionMessage.react('👎');

            const confirmationEmbed = new EmbedBuilder()
                .setColor(config.HexColour)
                .setAuthor({ name: `Suggestion from ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(suggestion)
                .setFooter({ text: `Suggestion ID: ${suggestionId} | Submitted at` })
                .setTimestamp();

            await interaction.reply({ content: 'Your suggestion has been submitted to the server staff for review!', embeds: [confirmationEmbed] });
        } catch (error) {
            console.error('[SUGGESTION]', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.HexColour)
                .setDescription('There was an error submitting your suggestion. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
