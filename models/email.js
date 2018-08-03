var nodemailer = require('nodemailer');

module.exports = {
    send:function(options){
      // we want to, subject, text : all as strings
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'your email',
            pass: 'your password'
          }
        });
      
        options.from = 'info.hebditch@gmail.com';
      
        transporter.sendMail(options, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    }
}
