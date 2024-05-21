// Required modules
const Discord = require('discord.js');
const config = require('./config');
const { connect, mongoose } = require('mongoose');
require('@colors/colors');
const {
    ActivityType,
    Client,
    Events,
    EmbedBuilder
} = require('discord.js');

// Handlers
const { loadEvents } = require('./src/handlers/events');
const { loadCommands } = require('./src/handlers/commands');

// Discord client setup
const client = new Client({ intents: 3276799 });
client.commands = new Discord.Collection();
client.buttons = new Discord.Collection();
client.selectMenus = new Discord.Collection();
client.modals = new Discord.Collection();
client.cooldowns = new Discord.Collection();

// Logging in and setting up presence
client.login(config.token).then(() => {
    console.clear();
    console.log(('Logged in as: ' + client.user.username + ` [${config.id}]`).brightCyan);
    const statusList = [
        'Use /help to get started.',
        'Join our support server - https://discord.gg/dKgrYcEx',
        'Vote for Suggestify for rewards!'
      ];
      // Rotate status every 3 seconds
        setInterval(() => {
          const randomIndex = Math.floor(Math.random() * statusList.length);
          const { ActivityType } = require('discord.js')
          client.user.setActivity(statusList[randomIndex], { type: ActivityType.Playing }) // Competing, Listening, etc
        }, 5000);
    //client.user.setPresence({
        //activities: [{
            //type: ActivityType.Custom,
            //name: 'irrelevant',
            //state: config.status
        //}],
        //status: 'online' // online, dnd, idle
    //});     

    // MongoDB connection
    mongoose.set('strictQuery', true);
    connect(config.database, {}).then(() => {
        console.log(('Connection established to database.').brightGreen);

        // Loading events and commands
        loadEvents(client);
        loadCommands(client);

    });
}).catch((err) => console.log(err));

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
           console.error(error);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'feedbackModal') {
            // Extract the feedback from the modal submission
            const feedback = interaction.fields.getTextInputValue('feedbackInput');

            // Fetch the feedback channel
            const feedbackChannelId = '1242218788879859772'; // Replace with your feedback channel ID
            const feedbackChannel = await client.channels.fetch(feedbackChannelId);
            
            // Send feedback to the specified channel
            if (feedbackChannel && feedbackChannel.isTextBased()) {
                const feedbackEmbed = new EmbedBuilder()
                    .setTitle('New Feedback')
                    .setDescription(`\`\`\`${feedback}\`\`\``)
                    .setColor('Blurple')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setFooter(
                        { text: 'Feedback submitted at'}
                    )
                    .setTimestamp();

                await feedbackChannel.send({ embeds: [feedbackEmbed] });
            } else {
                console.error(':x: Feedback channel not found or is not a text channel.');
            }
            await interaction.reply({ content: `Thank you for your feedback **${interaction.user.tag}**`, ephemeral: true });
        }
    }
});