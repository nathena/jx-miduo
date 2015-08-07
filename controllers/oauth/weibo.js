/**
 * Created by nathena on 15/1/23.
 */

var passport = require("../../lib/oauth2.qq.js").passport;
var AngularStatic = require("../angular.static");

//passport 连接
exports.accept = function accept(req,res,next){
    req.session = req.session || {};
    req.session.authState = crypto.createHash('sha1').update(-(new Date()) + '').digest('hex');

    passport.authenticate('weibo', {state: req.session.authState})(req, res, next);
}

//passport 验证
exports.authentication = function authentication(req,res,next){

    if(req.session && req.session.authState && req.session.authState === req.query.state) {

        passport.authenticate('weibo', {failureRedirect: AngularStatic.login})(req, res, next);

    } else {

        return next(new Error('Auth State Mismatch'));

    }
}

//passport 验证成功
exports.callback = function callback(req,res,next){

    User.loginByOpenId(req.body.id,"weibo",loginByOpenIdCallback);

    function loginByOpenIdCallback(err,data){

        if( err instanceof ServerError ){
            return next(err);
        }

        if( err || !data){
            res.cookie("openId",req.body.id,{httpOnly:true,path:'/'});
            res.cookie("openPlat","weibo",{httpOnly:true,path:'/'});
            req.session.__openId = req.body.id;
            res.redirect(AngularStatic.oauthRegister);
        }else{
            res.redirect(AngularStatic.user);
        }
    }
}
