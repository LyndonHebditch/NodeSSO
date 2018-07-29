const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema and model
const BlogPostSchema = new Schema({
    DateCreated: Date,
    Blog: String , // blog Id
    Content: [new Schema({
        Title:String,
        CultureKey: String,
        Body:String
    })]
});

const Post = mongoose.model('BlogPost', BlogPostSchema);

module.exports = Post;