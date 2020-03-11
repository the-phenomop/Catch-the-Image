const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    time: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);