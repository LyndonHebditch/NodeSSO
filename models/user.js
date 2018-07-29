const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema and model
const UserSchema = new Schema({
    UserName: {
        type:String,
        required: true,
        unique: true
    },
    Email: String,
    DateCreated: Date,
    Password: String,
    EmailConfirmed: Boolean
});

const User = mongoose.model('User', UserSchema);

module.exports = User;