var express = require('express');
var router = express.Router();
//var mailgun = require('../library/mail.js');
var Mailgun = require('mailgun-js');
var apiKey = 'key-878e35f184113b9e514598e5628dd59a';
var domain = 'go.bazarn.com'
router.get('/', function(req, res, next) {
  res.render('chat');
});
router.post('/sm', function(req, res, next) {
    var mailgun = new Mailgun({apiKey: apiKey, domain: domain});

    var data = {
    //Specify email data
      from: req.body.from,
    //The email to contact
      to: req.body.to,
    //Subject and text data
      subject: req.body.subject,
      html: req.body.message
    }

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {

        if (err) {
            res.render('error', { error : err});
            console.log("got an error: ", err);
        }

        else {
            res.json(body);
            console.log(body);
        }
    });
});
router.post('/submitMuti', function(req, res, next) {
    var mailgun = new Mailgun({apiKey: apiKey, domain: domain});

    var data = {
      from: req.body.from,
      to: req.body.to,
      subject: req.body.subject,
      html: req.body.message
    }
    var dataMail = req.body.mail;
    console.log(dataMail);
    dataMail.forEach(function(mail){
      mailgun.messages().send(mail, function (err, body) {
        if(err){
           console.log("got an error: ", err);
        }else{
          console.log(body)
        }
      });
    });
});


module.exports = router;
