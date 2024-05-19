// models/SuggestionChannel.js
const mongoose = require('mongoose');

const suggestionChannelSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true }
});

module.exports = mongoose.model('SuggestionSchema', suggestionChannelSchema);
