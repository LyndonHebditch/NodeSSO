const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const Post = require('../models/blog_post');

function formatPostContentResponse(content){
    return {
        Id: content['_id'],
        Title: content.Title,
        Body: content.Body,
        CultureKey: content.CultureKey
    }
}

function formatPostResponse(post){
    return {
        Id: post['_id'],
        DateCreated: post.DateCreated,
        Content:(post.Content || []).map(c => formatPostContentResponse(c))
    };
}

function formatBlogResponse(blog){
    var _blog =  {
        Id: blog['_id'],
        Name: blog.Name,
        DateCreated: blog.DateCreated
    };

    return _blog;
}

router.get('/', function(req, res){
    Blog.find(function(err, data){
        res.send(data.map( d => formatBlogResponse(d)));
    })
});

router.post('/', function(req, res){
    var body = JSON.parse(req.body);

    if(body.name){
        var blog = new Blog({
            Name: body.name,
            DateCreated: new Date(),
            Owner: req.user.Id,            
            Tags: body.tags || []
        });

        blog.save(function(err){
            if(err) res.send({ success: false, message: err })
            else res.send({ success: true, message: `${body.name} succesfully created` })
        });
    }
});

router.get('/:key/Posts', function(req, res){
    Post.find({ Blog: req.params.key }, function(err, data){
        if(err) res.send({success: false, message:err })
        else res.send(data.map(d => formatPostResponse(d)))
    })
});

router.post('/:key/AddPost', function(req, res){
    var blogId = req.params.key;
    var body = JSON.parse(req.body);
    
    if(body.title && body.body){
        let post = new Post({
            DateCreated: new Date(),
            Blog: blogId,
            Content: [{
                Title: body.title,
                Body:body.body,
                CultureKey: body.culture || ''
            }]
        });

        post.save(function(err,data){
            if(err)res.send({success: false, message: err})
            else res.send(data)
        })
    }
})

router.put('/', function(req, res){

});

router.delete('/', function(){

});

module.exports = router;