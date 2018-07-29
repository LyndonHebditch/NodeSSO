const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema and model
const BlogSchema = new Schema({
    Name: {
        type:String,
        required: true,
        unique: true
    },
    DateCreated: Date,
    Description: String,
    Owner: String,
    Tags:[String]
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;