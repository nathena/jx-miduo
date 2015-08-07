
var base = require("./lib/base");

var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var favicon = require('serve-favicon');
var staticServer = require('serve-static');

var app = express();

var appConfig = require("./appConfig");

//log
base.log(app);

//cookie & session
app.use(cookieParser(appConfig.cookie_prefix));
app.use(session({
    store: new RedisStore({
        host: appConfig.redis.host,
        port: appConfig.redis.port,
        db: appConfig.redis.db
    }),
    resave:appConfig.session.resave,
    saveUninitialized:appConfig.session.saveUninitialized,
    secret: appConfig.session.secret
}));
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parase application/form-data
app.use(multipart());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', "ejs");
app.engine('.html', require('ejs').renderFile);
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

////qq passport
//var qqPassport = require("./lib/oauth2.qq.js");
//qqPassport.init(app);
//
////weibo passport
//var weiboPassport = require("./lib/oauth2.weibo.js");
//weiboPassport.init(app);

//actons controller
var controllers = require('./controllers');
controllers(app);

//static path
//app.use(staticServer(path.join(__dirname, 'public')));

//catch 404 and forward to error handler
app.use(function(req, res, next) {

    logger.info(req.path+" >>  Not Found ");

    if( req.isJsonFormat ){
        res.json(new NotFound(req.path+" >>  Not Found ").toJSON());
    }else{
        res.status(404);
        res.render('errors/404.html', {
            message: "Not Found",
            error: {}
        });
    }
});

// no stacktraces leaked to user
app.use(function(err, req, res, next) {

    logger.error(err.message);

    if( req.isJsonFormat ){
        res.json(err.toJSON());
    }else{
        res.status(err.status || 500);
        res.render('errors/500.html', {
            message: err.message,
            error: {}
        });
    }
});

//系统uncaughtException
process.on("uncaughtException", function (err) {

    logger.error(err.message);

});

module.exports = app;
