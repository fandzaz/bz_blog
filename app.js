var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

async = require('async');
var multer  = require('multer')
var requestIp = require('request-ip');
//var Mailgun = require('mailgun-js');
var fs = require('fs');
db = require('./database/mongodb.js');
chat_tool = require('./database/chat_tool.js');
function_t = require('./database/function_tool.js');
socket_io = require('./library/io.js');

var app = express();
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept, Origin, X-Session-ID');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,TRACE,COPY,LOCK,MKCOL,MOVE,PROPFIND,PROPPATCH,UNLOCK,REPORT,MKACTIVITY,CHECKOUT,MERGE,M-SEARCH,NOTIFY,SUBSCRIBE,UNSUBSCRIBE,PATCH');
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '1000');

    next();
}
app.use(allowCrossDomain);
libUpload = require('./library/upload.js');

var ipMiddleware = function(req, res, next) {
    var clientIp = requestIp.getClientIp(req);
    next();
};

app.use(requestIp.mw());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','html');
app.engine('html',require('ejs').renderFile);





// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/uploads',  express.static(__dirname + '/uploads'));
var routes = require('./routes/index');
var users = require('./routes/users');
var chat = require('./routes/chat');
var mail = require('./routes/mail');

app.use('/', routes);
app.use('/users', users);
app.use('/chat', chat);
app.use('/mail', mail);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
