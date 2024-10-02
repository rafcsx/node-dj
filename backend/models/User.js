const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    googleId: { type: String, required: true },
    avatar: { type: String },
});

module.exports = mongoose.model('User', UserSchema);
