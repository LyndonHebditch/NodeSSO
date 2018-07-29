var nodemailer = require('nodemailer');

module.exports = {
    send:function(options){
      // we want to, subject, text : all as strings
      var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'info.hebditch@gmail.com',
            pass: '"2a2319ba-657a-30e6-02d9-328f67fd0af7c16f"' //used speach marks for extra complexity
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
