const express = require('express');
const router = express.Router();
const User = require('../models/user');
const email = require('../models/email');
const url = require('url');
const Security = require('../services/SecurityService.js');
const jwt = require('jsonwebtoken');
const config = require('../config');
var fs = require('fs');

router.use(function (req, res, next) {
    next();
})

router.post('/Authenticate', function(req, res){
    var body = JSON.parse(req.body);
    
    if(body.email && body.password){        
        User.findOne({Email: body.email}).then(function(data){
            
            if(data){
                if(Security.compare(data.Password, body.password)){
                    res.send({
                        auth: true,
                        token:jwt.sign({ id: data._id }, config.secret + new Date().toISOString().substring(0,10), { expiresIn: 86400 })
                    });
                }
                else{
                    res.send({
                        auth: false,
                        error: 'Failed to authenticate with given details'
                    });
                }
            }
            else{                    
                res.send({
                    auth: false,
                    error: 'Failed to authenticate with given details'
                });
            }
        })        
    }
    else{
        res.send({
            auth: false,
            error: 'Invalid model sent in request'
        });
    }
});

router.post('/Register', function(req, res){
    var body = JSON.parse(req.body);
    
    // we should have a username, a password and an email
    if(body.username && body.password && body.email){
        const newUser = new User({
            UserName: body.username,
            Password: Security.salt(body.password),
            Email: body.email,
            DateCreated: new Date(),
            EmailConfirmed: false
        });
        
        newUser.save(function(err){
            if(err){ 
                res.send(`Error: ${err.toString()}`);
            }
            else {
                User.findOne({ UserName: body.username }).then(function(user){
                    email.send({
                        to: body.email,
                        subject:'User Registration',
                        html:`Welcome ${body.username}. <br/> to confirm registration please click <a href="${config.environment}/ConfirmRegistration?user=${jwt.sign({ id: body.username }, config.secret + new Date().toISOString().substring(0,10), { expiresIn: 86400 })}">here</a>`
                    });
                })               

                res.send({
                    error:'Invalid request'
                });
            }
        })      
    }
    else{
        res.send('Invalid user model sent in request');
    }
});

router.get('/ConfirmRegistration', function(req, res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    jwt.verify(query.user, config.secret + new Date().toISOString().substring(0,10), function(err, decoded) {
        if(decoded){
            User.findOne({UserName: decoded.id}).then(function(user){
                user.EmailConfirmed = true;

                user.save(function(err){
                    if(err) res.send('Somethings gone wrong');
                    else res.send('thankyou');
                })
            })
        }
        else{
            res.send('Somethings gone wrong');
        }
    });
});

router.post('/ResetPassword', function(req, res){
    var body = JSON.parse(req.body);
    let user = req.user;
    
    // check requirements
    console.log(user)
    if(user && Security.compare(user.Password, body.password) && body.newPassword && body.confirmPassword){
        if(body.newPassword === body.confirmPassword){                
            
            user.Password = Security.salt(body.newPassword);
            user.save(function(err){
                if(err) res.send('Somethings gone wrong');
                else res.send({
                    success: true,
                    message:'Password has been updated'
                })
            })
        }
        else{
            res.send({
                error:'Invalid request'
            });
        }
    }
    else{
        res.send({
            error:'Invalid request'
        });
    }
});

router.get('/ResetPassword', function(req, res){
    res.writeHead(200, {'content-type':'text/html'});

    let url = require('url');
    let url_parts = url.parse(req.url, true);
    let query = url_parts.query;

    jwt.verify(query.ticket, config.secret + new Date().toISOString().substring(0,10), function(err, decoded) {
        // keep valid for 1 hour
        if(decoded && decoded.id){            
            var html = fs.readFileSync('./pages/ResetPassword.html', 'utf8');
            html = html.replace('{{ticket}}', query.ticket);
            console.log(html);
            res.write(html);
        }
        else{
            res.write('Access Denied');
        }
    })
    res.end();
});

router.post('/ConfirmReset', function(req, res){
    let body = req.body.split('&')
        .filter(p => p.split('=')[1])
        .map(p => unescape(p));

    // build expected body from form input
    body = body.reduce((obj, val) => {
        let parts = val.split('=');
        obj[parts[0]] = parts[1];

        return obj;
    }, {});

    if(body.user && body.password && body.confirmPassword){
        jwt.verify(body.user, config.secret + new Date().toISOString().substring(0,10), function(err, decoded) {
            let timeDif = Math.abs(new Date() - new Date(decoded.requested));
            let minutes = Math.floor((timeDif/1000)/60);

            if(decoded.id && minutes <= 60){ 
                User.findOne({_id: decoded.id}, function(err, user){
                    if(body.password === body.confirmPassword){
                        user.Password = Security.salt(body.password);
                        user.save(function(err){

                            if(err){
                                res.send({
                                    success:false,
                                    message:'Invalid Request'
                                });
                            }
                            else{
                                res.send({
                                    success:true,
                                    message:'Password has been changed'
                                });
                            }
                        })
                    }
                    else{
                        res.send({
                            success:false,
                            message:'Password do not match'
                        });
                    }
                })
            }
        });
    }
});

router.post('/ForgotPassword', function(req, res){
    let body = JSON.parse(req.body);
    
    if(body.email){
        User.find({Email:body.email}, function(err, user){
            if(user){            
                email.send({
                    to: user[0].Email,
                    subject:'Password change request',
                    html:`<p>You have submitted a password change request</p>` +
                         `if this was you then please follow this <a href="${config.environment}/Account/ResetPassword?ticket=${jwt.sign({id:user[0]._id, requested: new Date()}, config.secret + new Date().toISOString().substring(0,10), { expiresIn: 86400 })}">link.</a>`
                })
            }
            else{
                console.log('none')
                email.send({
                    to: body.email,
                    subject:'Password reset attempt',
                    html:`<p>You(Or someone else) has attempted to log in to ${config.environment} usingthis email address</p>` +
                         `<p>However noone in our system has been registered with this email.</p>` + 
                         `If you were trying to access ${config.environment} please try again with the email you used toi sign up.` + 
                         `<p>Thankyou</p>`
                })
            }

            res.send({
                success:true,
                message:'Check Email'
            });
        });        
    }
});

module.exports = router;