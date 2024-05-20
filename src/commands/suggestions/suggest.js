const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const generateId = require('../../utils/generateId');
const SuggestionChannel = require('../../schemas/suggestionSchema');
const SuggestionSettings = require('../../schemas/suggestionSchema'); // Assuming you're using the same schema for both normal and anonymous suggestions
const config = require('../../../config');

module.exports = {
    cooldown: 7,
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Submit a suggestion')
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('Content of suggestion')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('attachment')
                .setDescription('Link to attachment')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const suggestion = interaction.options.getString('suggestion');
            const attachmentLink = interaction.options.getString('attachment');
            const suggestionChannelData = await SuggestionChannel.findOne({ guildId: interaction.guild.id });

            // Check if suggestions are enabled
            const settings = await SuggestionSettings.findOne({ guildId: interaction.guild.id });
            if (!settings || !settings.suggestionsEnabled) {
                return interaction.reply({ content: '<a:x_red:1240354262387654707> Suggestions are not **enabled** in this server.', ephemeral: true });
            }

            const suggestionChannel = interaction.client.channels.cache.get(suggestionChannelData.channelId);
            if (!suggestionChannel) {
                return interaction.reply({ content: '<a:x_red:1240354262387654707> Suggestion channel has not been set up.', ephemeral: true });
            }

            let rolesToMention = '';
            if (suggestionChannelData.roles && suggestionChannelData.roles.length > 0) {
                rolesToMention = suggestionChannelData.roles.map(roleId => `<@&${roleId}>`).join(' ');
            }

            const suggestionId = generateId();
            const suggestionEmbed = new EmbedBuilder()
                .setColor(config.colour)
                .setDescription(suggestion)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setAuthor({ name: `Suggestion from ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setFooter({ text: `Suggestion ID: ${suggestionId} | Submitted at` })
                .addFields(
                    { name: 'Votes', value: `Total: **0**\nUpvotes: **0** \`0%\`\nDownvotes: **0** \`0%\`` }
                )
                .setTimestamp();

            if (attachmentLink) {
                suggestionEmbed.setImage(attachmentLink);
            }

            const suggestionMessage = await suggestionChannel.send({ content: rolesToMention, embeds: [suggestionEmbed] });

            await suggestionMessage.react('👍');
            await suggestionMessage.react('👎');

            // Save suggestion ID to the schema
            suggestionChannelData.suggestionIds.push(suggestionId);
            suggestionChannelData.content = suggestion; // Save the content of the suggestion
            suggestionChannelData.submittedBy = interaction.user.id; // Save the ID of the user who submitted the suggestion
            await suggestionChannelData.save();

            // Event listener for reaction add/remove
            const collector = suggestionMessage.createReactionCollector({ dispose: true });

            // Calculate percentage with a maximum of 100%
            const calculatePercentage = (count, total) => {
                let percentage = total === 0 ? 0 : (count / total) * 100;
                return Math.min(100, percentage);
            };

            // Format percentage string
            const formatPercentage = (percentage) => {
                return percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2);
            };

            collector.on('collect', async (reaction, user) => {
                if (user.bot) return;
                try {
                    const oppositeReaction = reaction.emoji.name === '👍' ? '👎' : '👍';
                    const oppositeReactionObj = reaction.message.reactions.cache.find(r => r.emoji.name === oppositeReaction);

                    if (oppositeReactionObj && oppositeReactionObj.users.cache.has(user.id)) {
                        await oppositeReactionObj.users.remove(user.id);
                    }

                    const upvotes = reaction.message.reactions.cache.get('👍').count - 1;
                    const downvotes = reaction.message.reactions.cache.get('👎').count - 1;

                    const totalVotes = upvotes + downvotes;
                    const upvotePercentage = calculatePercentage(upvotes, totalVotes);
                    const downvotePercentage = calculatePercentage(downvotes, totalVotes);

                    const formattedUpvotePercentage = formatPercentage(upvotePercentage);
                    const formattedDownvotePercentage = formatPercentage(downvotePercentage);

                    suggestionEmbed.setFields([
                        {
                            name: 'Votes',
                            value: `Total: **${totalVotes}**\nUpvotes: **${upvotes}** \`${formattedUpvotePercentage}%\`\nDownvotes: **${downvotes}** \`${formattedDownvotePercentage}%\``
                        }
                    ]);

                    await suggestionMessage.edit({ embeds: [suggestionEmbed] });
                } catch (error) {
                    console.error('[SUGGESTION]', error);
                }
            });

            collector.on('remove', async (reaction, user) => {
                if (user.bot) return;
                try {
                    const upvotes = reaction.message.reactions.cache.get('👍').count - 1;
                    const downvotes = reaction.message.reactions.cache.get('👎').count - 1;

                    const totalVotes = upvotes + downvotes;
                    const upvotePercentage = calculatePercentage(upvotes, totalVotes);
                    const downvotePercentage = calculatePercentage(downvotes, totalVotes);

                    const formattedUpvotePercentage = formatPercentage(upvotePercentage);
                    const formattedDownvotePercentage = formatPercentage(downvotePercentage);

                    suggestionEmbed.setFields([
                        {
                            name: 'Votes',
                            value: `Total: **${totalVotes}**\nUpvotes: **${upvotes}** \`${formattedUpvotePercentage}%\`\nDownvotes: **${downvotes}** \`${formattedDownvotePercentage}%\``
                        }
                    ]);

                    await suggestionMessage.edit({ embeds: [suggestionEmbed] });
                } catch (error) {
                    console.error('[SUGGESTION]', error);
                }
            });

            const confirmationEmbed = new EmbedBuilder()
                .setColor(config.colour)
                .setAuthor({ name: `Suggestion from ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(suggestion)
                .setFooter({ text: `Suggestion ID: ${suggestionId} | Submitted at` })
                .setTimestamp();

            if (attachmentLink) {
                confirmationEmbed.setImage(attachmentLink);
            }

            await interaction.reply({ content: '<a:check_green:1240349082149715978> Your suggestion has been submitted to the server staff for review!', embeds: [confirmationEmbed] });
        } catch (error) {
            console.error('[SUGGESTION]', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.colour)
                .setDescription('There was an error submitting your suggestion. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
