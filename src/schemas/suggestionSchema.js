const { Schema, model, mongoose } = require('mongoose');

const suggestionSchemaa = new Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    suggestionsEnabled: { type: Boolean, default: false },
    roles: { type: [String], default: [] },
});

module.exports = mongoose.model('SuggestionSchema', suggestionSchemaa);
