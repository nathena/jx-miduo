/**
 * Created by nathena on 15/1/23.
 */

var appConfig = require("../appConfig");
var passport  = require("passport");
var QQStrategy = require("passport-qq").Strategy;

var QQ_APP_ID = appConfig.qqOauth.appid;
var QQ_APP_KEY = appConfig.qqOauth.appkey;
var QQ_APP_CB  = appConfig.qqOauth.callback;


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(
    new QQStrategy(
        {
            clientID: QQ_APP_ID,
            clientSecret: QQ_APP_KEY,
            callbackURL: QQ_APP_CB
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