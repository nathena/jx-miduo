/**
 * Created by nathena on 15/1/23.
 */

var appConfig = require("../appConfig");
var passport  = require("passport");
var WeiBoStrategy = require("passport-weibo").Strategy;

var WEIBO_CLIENT_ID = appConfig.weiboOauth.appid;
var WEIBO_CLIENT_SECRET = appConfig.weiboOauth.appkey;
var WEIBO_CLIENT_CB = appConfig.weiboOauth.callback;


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(
    new WeiBoStrategy(
        {
            clientID: WEIBO_CLIENT_ID,
            clientSecret: WEIBO_CLIENT_SECRET,
            callbackURL: WEIBO_CLIENT_CB
        }
        ,function(accessToken, refreshToken, profile, done){
            process.nextTick(function () {
                return done(null, profile);
            });
        }
    )
);

exports.init = function init(app){

    app.use(passport.initialize());
    app.use(passport.session());
}

exports.passport = passport;