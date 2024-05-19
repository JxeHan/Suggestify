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

            if (!suggestionChannelData) {
                return interaction.reply({ content: '<a:x_red:1240354262387654707> Suggestion channel has not been set up.', ephemeral: true });
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

            // Event listener for reaction add/remove
            const collector = suggestionMessage.createReactionCollector({ dispose: true });

            // Variable to track the reaction user ID
            let reactionUser = null;

// Calculate percentage with a maximum of 100%
const calculatePercentage = (count, total) => {
    let percentage = total === 0 ? 0 : (count / total) * 100;
    return Math.min(100, percentage);
};

// Format percentage string
const formatPercentage = (percentage) => {
    return percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2);
};

// Event listener for reaction add/remove
collector.on('collect', async (reaction, user) => {
    // Check if the reaction is from a user and not the bot
    if (user.bot) return;

    try {
        // Fetch the reaction counts asynchronously
        await reaction.message.fetch();

        // Remove previous reaction if it exists
        if (reactionUser && reactionUser !== user.id) {
            const previousReaction = reaction.message.reactions.cache.find(r => r.users.cache.has(reactionUser));
            if (previousReaction) {
                await previousReaction.users.remove(reactionUser);
            }
        }

        // Update reaction user
        reactionUser = user.id;

        // Get the reaction counts
        upvotes = reaction.message.reactions.cache.get('👍').count - 1;
        downvotes = reaction.message.reactions.cache.get('👎').count - 1;

        // Calculate total votes
        const totalVotes = upvotes + downvotes;

        // Calculate percentages with a maximum of 100%
        const upvotePercentage = calculatePercentage(upvotes, totalVotes);
        const downvotePercentage = calculatePercentage(downvotes, totalVotes);

        // Format percentage strings
        const formattedUpvotePercentage = formatPercentage(upvotePercentage);
        const formattedDownvotePercentage = formatPercentage(downvotePercentage);

        // Update the vote count in the suggestion embed based on the reaction emoji
        suggestionEmbed.setFields([
            { 
                name: 'Votes', 
                value: `Total: **${totalVotes}**\nUpvotes: **${upvotes}** \`${formattedUpvotePercentage}%\`\nDownvotes: **${downvotes}** \`${formattedDownvotePercentage}%\``
            }
        ]);

        // Edit the suggestion message with the updated embed
        await suggestionMessage.edit({ embeds: [suggestionEmbed] });
    } catch (error) {
        console.error('[SUGGESTION]', error);
    }
});

collector.on('remove', async (reaction, user) => {
    // Check if the reaction is from a user and not the bot
    if (user.bot) return;

    try {
        // Fetch the reaction counts asynchronously
        await reaction.message.fetch();

        // Clear reaction user if removing their reaction
        if (reactionUser === user.id) {
            reactionUser = null;
        }

        // Get the reaction counts
        upvotes = reaction.message.reactions.cache.get('👍').count - 1;
        downvotes = reaction.message.reactions.cache.get('👎').count - 1;

        // Calculate total votes
        const totalVotes = upvotes + downvotes;

        // Calculate percentages with a maximum of 100%
        const upvotePercentage = calculatePercentage(upvotes, totalVotes);
        const downvotePercentage = calculatePercentage(downvotes, totalVotes);

        // Format percentage strings
        const formattedUpvotePercentage = formatPercentage(upvotePercentage);
        const formattedDownvotePercentage = formatPercentage(downvotePercentage);

        // Update the vote count in the suggestion embed based on the reaction emoji
        suggestionEmbed.setFields([
            { 
                name: 'Votes', 
                value: `Total: **${totalVotes}**\nUpvotes: **${upvotes}** \`${formattedUpvotePercentage}%\`\nDownvotes: **${downvotes}** \`${formattedDownvotePercentage}%\``
            }
        ]);

        // Edit the suggestion message with the updated embed
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


          
