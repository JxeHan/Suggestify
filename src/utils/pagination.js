const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function sendPagination(interaction, pages) {
    let currentPage = 0;
    const maxPages = pages.length;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('1241722278002294834')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('1241722252257394728')
                .setStyle(ButtonStyle.Primary),
        );

    const message = await interaction.reply({ embeds: [pages[currentPage]], components: [row] });

    const filter = (i) => i.customId === 'prev' || i.customId === 'next';
    const collector = message.createMessageComponentCollector({ filter });

    collector.on('collect', async (i) => {
        // Check if the user who clicked the button is the same as the user who issued the command
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: '<a:x_red:1240354262387654707> You can\'t interact with these buttons.', ephemeral: true });
            return;
        }

        if (i.customId === 'prev') {
            currentPage -= 1;
        } else if (i.customId === 'next') {
            currentPage += 1;
        }

        if (currentPage < 0) {
            currentPage = maxPages - 1;
        } else if (currentPage >= maxPages) {
            currentPage = 0;
        }

        await i.update({ embeds: [pages[currentPage]] });
    });

    collector.on('end', () => {
        message.edit({ components: [] });
    });
}

module.exports = { sendPagination };
