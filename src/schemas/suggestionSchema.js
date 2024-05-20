const { Schema, model } = require('mongoose');

const suggestionSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    suggestionsEnabled: { type: Boolean, default: false },
    roles: { type: [String], default: [] },
    suggestionIds: { type: [String], default: [] }, // Add suggestionIds field
    content: { type: String, required: true }, // Content of the suggestion
    submittedBy: { type: String, required: true }, // ID of the user who submitted the suggestion
    timestamp: { type: Date, default: Date.now } // Timestamp when the suggestion was submitted
});

module.exports = model('SuggestionSchema', suggestionSchema);
