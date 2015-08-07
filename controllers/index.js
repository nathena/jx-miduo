var ctx = require("./context");
var user = require("./user");
var qq = require("./oauth/qq"); //qq oauth
var weibo = require("./oauth/weibo"); //weibo oauth
var Angular = require("./angular.static");
var captcha = require("../lib/captcha");
var qrcode = require("../lib/qrcode");

module.exports = function(app) {

    app.route("/").all(
        function(req,res,next){
            if( ctx.authentication(req) ){
                return res.redirect(Angular.user);
            }
            next();
        }
        ,function(req,res,next){
            res.redirect(Angular.login);
        }
    );

    app.route("/login").all(ctx.requireJsonFormat).post(user.login);
    app.route("/register").all(ctx.requireJsonFormat).post(user.reqister);
    app.route("/logout").all(ctx.requireJsonFormat,user.logout);

    //验证email是否已经注册
    app.route("/checkEmail").all(ctx.requireJsonFormat).post(user.checkEmail);

    app.route("/createSc").all(ctx.requireJsonFormat).post(user.createSc);

    //找回密码URL
    app.route("/fpwd/:forgetParam").get(user.forgetPwd);
    //修改密码
    app.route("/rpwd/:encryInfo").post(user.resetPwd);

    //用户中心
    app.route("/wsAdmin/").all(ctx.requireJsonFormat,ctx.requireRestAuthentication,user.wsAdmin);
    app.route("/selectScene/").all(ctx.requireJsonFormat,ctx.requireRestAuthentication,user.selectScene);


    app.route("/oauth/qq").get(qq.accept);
    app.route("/oauth/qq/callback").all(qq.authentication,qq.callback);

    app.route("/oauth/weibo").get(weibo.accept);
    app.route("/oauth/weibo/callback").all(weibo.authentication,weibo.callback);

    //验证码
    app.route("/captcha").get(function(req,res,next){

        logger.info(" session captcha == "+req.session.captcha);

        var arr = captcha.get();
        var text = arr[0];
        var buffer = arr[1];

        req.session.captcha = text;
        res.send(buffer);
    });

    //test 二维码
    app.get("/qrcode",function(res,res,next){

        res.send(qrcode.createImgTag(5,"http://www.youmeihunjia.com/"));
    })
};




/**
 * 
 * var app = express();

app.route('/events')
.all(function(req, res, next) {
  // runs for all HTTP verbs first
  // think of it as route specific middleware!
})
.get(function(req, res, next) {
  res.json(...);
})
.post(function(req, res, next) {
  // maybe add a new event...
})

 */