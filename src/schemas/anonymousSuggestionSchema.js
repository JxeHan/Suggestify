// schemas/anonymousSuggestionSchema.js
const { Schema, model } = require('mongoose');

const anonymousSuggestionSchema = new Schema({
    guildId: String,
    anonymousEnabled: { type: Boolean, default: false }
});

module.exports = model('anonymousSuggestionSchema', anonymousSuggestionSchema);
