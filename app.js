const http = require('http');
    express = require('express'),
    UserService = require('./services/UserService.js'),
    AccountService = require('./services/AccountService'),
    BlogService = require('./services/BlogService'),
    jwt = require('jsonwebtoken'),
    config = require('./config'),
    db = require('./models/db'),    
    User = require('./models/user'),
    app = express();

app.use(function(req, res, next){
    var data = '';
    var token = req.headers['x-access-token'];

    // lets add in the date to thrown some extra complexity into these signs
    jwt.verify(token, config.secret + new Date().toISOString().substring(0,10), function(err, decoded) {
        User.findOne({_id: decoded ? decoded.id : 0 }, function(err, user){
            req.userId = decoded ? decoded.id : null;
            req.user = user;
        
            req.setEncoding('utf8');

            req.on('data',function(chunk){
                data += chunk;
            })

            req.on('end', function(){
                req.body = data;
                next();
            })
        })
    });
});

// define services to be used by app
app.use('/User', UserService);

app.use('/Account', AccountService);

app.use('/Blog', BlogService);

// handle unknown endpoint calls
app.get('/:endpoint', function(req, res){
    res.send('Not Implemented');
})

app.get('/:endpoint/:key', function(req, res){
    res.send('Not Implemented');
})

// start listening to port
//http.createServer(app).listen(8000);
http.createServer(app).listen(3000, function(){
    console.log(`server now online`);
});
