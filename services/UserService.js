const express = require('express');
const router = express.Router();
const User = require('../models/user');

function prepUser(user){
    return {
        UserName: user.UserName,
        Email: user.Email,
        DateCreated: user.DateCreated,
        Active: user.EmailConfirmed
    }
}

function getKnownUsers(req, callback){
    User.find({_id: req.userId}).then(callback);
}

router.use(function (req, res, next) {
    if(req.userId){
        next();
    }
    else{
        res.send({
            error:{
                message:'Access Denied'
            }
        });
    }
})

router.get('/Me', function(req, res){
    // we are now connected to the db
    res.send(req.user);
})

/**
 * Leave these at the bottom so that any above that follow pattern BUT are specific are hit first
 * e.g if /Me is below /:key then /:key will be hit
 */
router.get('/', function(req, res){
    getKnownUsers(req, function(data){
        res.send(data.map(u => prepUser(u)));
    });      
})

router.get('/:key', function(req, res){
    // we are now connected to the db
    getKnownUsers(req, function(data){
        var valid = data.filter(u => u.UserName === req.params.key);
        res.send(valid.map(u => prepUser(u)));
    });   
})

router.post('/', function(req, res){
    res.send('User creation is handled through the Regsiter call');
})

module.exports = router;