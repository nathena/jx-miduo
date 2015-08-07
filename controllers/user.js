var Validator = require("../lib/validator");
var User = require("../models/user");
var ctx = require("./context");
var crypto = require("../lib/crypto");
var Angular = require("./angular.static");
var UserScene = require("../models/userScene");

//登录
exports.login = function login(req,res,next){

    logger.debug("/controllers/index/login");

    var email = req.body.email;
    var password = req.body.password;

    if( Validator.IsNull(email) || Validator.IsNull(password)){
        return next(new InvalidParamError());
    }

    User.loginByEmail(email,password,loginByEmailCall);

    function loginByEmailCall(err,data){
        if( err ){
            return next(err);
        }

        if( !data ){
            return next(new DataNotFoundError());
        }

        ctx.initContextSession(data.uid,data.email,req);

        res.json({code:0,msg:data.email});
    }
}


/**
 * add a new user
 * @param  {Object}   req  the instance of request
 * @param  {Object}   res  the instance of response
 * @param  {Function} next the next handler
 * @return {null}
 */
exports.reqister = function reqister(req, res, next) {
    logger.debug('/controllers/user/reqister' );

    //验证会话
    var openId = req.body.openId || req.cookies.openId;
    var sessionOpenId = req.session.__openId;
    if( sessionOpenId){
        if( openId != sessionOpenId ){
            return next(new SessionError());
        }
        req.session.__openId = null;
        delete req.session.__openId;
    }

    var openPlat = req.body.openPlat || req.cookies.openPlat;

    var email = req.body.email;
    var password = req.body.password;

    if( !Validator.check(Validator.Email,email) || Validator.IsNull(password) ){

        logger.error( JSON.stringify(req.body));

        return next(new InvalidParamError());
    }

    var vCode = req.body.vCode;
    var sessionVCode = req.session.captcha;
    if( sessionVCode  ){
        if( vCode!=sessionVCode ){
            return next(new ValiCodeSessionError());
        }
        req.session.captcha = null;
        delete req.session.captcha;
    }

    var param = {};
    param.email = email.trim();
    param.encryPwd =  password.trim();
    param.openId = openId;
    param.openPlatType = openPlat;

    User.add(param, function (err) {

        if (err) {
            return next(err);
        }

        res.json({code:0,msg:"successful"});
    });
}


var logout = exports.logout = function logout(req,res,next){

    ctx.destroyContextSession(req);

    res.redirect(Angular.login);
}

exports.forgetPwd = function forgetPwd(req,res,next){

    var encodeparam = req.params.forgetParam;
    if( !encodeparam ){
        return next(new InvalidParamError("不知道你要做什么"));
    }

    //解码
    var uid;
    try
    {
        var param = crypto.aseDecode(param);
        param =  param.split(":");
        if( !param || param.length !=2 ){
            return next(new InvalidParamError("参数解码有误，不知道你要做什么"));
        }
        uid = param[0];

        var expiredTime = parseInt(param[1],10);

        var nowTime = new Date().getTime();
        if( nowTime>expiredTime ){
            return next(new InvalidParamError("修改密码地址已过期"));
        }
    }
    catch(ex)
    {
        return next(new InvalidParamError("参数解码有误，不知道你要做什么"));
    }

    req.session.__resetPwdUID = uid;

    res.render("user/forgetpasswd.html",{encryInfo:encodeparam});
}

exports.resetPwd = function resetPwd(req,res,next){

    var uid = req.session.__resetPwdUID;
    req.session.__resetPwdUID = null;
    delete req.session.__resetPwdUID;

    if( Validator.IsNull(uid) ){
        return next(new InvalidParamError("重置密码失败，用户签名不存在"));
    }

    var encodeparam = req.params.encryInfo;
    if( !encodeparam ){
        return next(new InvalidParamError("重置密码失败,不知道你要做什么"));
    }

    //解码
    var uid;
    try
    {
        var param = crypto.aseDecode(param);
        param =  param.split(":");
        if( !param || param.length !=2 ){
            return next(new InvalidParamError("重置密码失败,参数解码有误，不知道你要做什么"));
        }
        uid = param[0];

        var expiredTime = parseInt(param[1],10);

        var nowTime = new Date().getTime();
        if( nowTime>expiredTime ){
            return next(new InvalidParamError("重置密码失败,修改密码签名已过期"));
        }
    }
    catch(ex)
    {
        return next(new InvalidParamError("重置密码失败，参数解码有误，不知道你要做什么"));
    }

    var pwd1 = req.body.pwd1,pwd2 = req.body.pwd2;
    if( pwd1!= pwd2 ){
        return next(new InvalidParamError("重置密码失败，两次密码不一直"))
    }

    User.modifyPwd(uid,pwd1,function(err,data){

        if( err ){
            return next(new ServerError("重置密码失败，"+err.message));
        }

        logout(req,res,next);
    });
}

exports.wsAdmin = function wsAdmin(req,res,next){

    var userSession  = ctx.getContextSession(req);
    if( !userSession ){
        return next(new SessionError("用户签名不存在"));
    }

    var uid = userSession.uid;

    var param = {};
    UserScene.getWeddingSceneInfo(uid,function(err,data){

        if( err ){
            return next(err);
        }

        param.code = 1;
        param.msg = "successful";
        param.groom = data.groom_name;
        param.bride = data.bride_name;
        param.wedDate = data.wed_date;
        param.lsLoginPath = data.ls_login_path;
        param.qrcodeScPath = data.qrcode_scene_ctrl;
        param.qrcodeScUrl = data.qrcode_scene_ctrl_url;
        param.qrcodeGuest = data.qrcode_guest;
        param.qrcodeGuestUrl = data.qrcode_guest_url;

        loadSceneList();
    })

    function loadSceneList(){
        UserScene.getUserSceneList(uid,function(err,data){
            //if( err ){
            //    return next(err);
            //}

            param.scenes = data;
            res.json(param);
        })
    }
}

exports.selectScene = function selectScene(req,res,next){

    var userSession  = ctx.getContextSession(req);
    if( !userSession ){
        return next(new SessionError("用户签名不存在"));
    }

    var sceneIds = req.body.sceneIds;
    var uid = userSession.uid;

    UserScene.saveUserSceneSetting(uid,sceneIds,function(err,data){
        if( err ){
            return next(err);
        }

        res.json({code:0,msg:"successful"});
    })
}

exports.checkEmail = function checkEmail(req,res,next){
    var email = req.body.email;
    if( !Validator.check(Validator.Email,email) ){
        logger.debug("/controll/user/checkEmail >> email为空或格式不正确 "+email);
        return next(new InvalidParamError("email为空或格式不正确"));
    }

    User.checkUserExistByEmail(email,function(err,isNotExist){
        if(err){
            logger.debug(err);
            return next(err);
        }

        if( isNotExist ){
            res.json({code:0,msg:"ok"});
        }else{
            res.json({code:0,msg:"err"});
        }
    })
}

exports.createSc = function(req,res,next){

    var userSession  = ctx.getContextSession(req);
    if( !userSession ){
        return next(new SessionError("用户签名不存在"));
    }

    var groomName = req.body.groomName;
    var brideName = req.body.brideName;


    if( Validator.IsNull(groomName) || Validator.IsNull(brideName) ){
        logger.debug("/controll/user/createSc >> 新郎或新娘数据不完整 "+groomName+" "+brideName);
        return next(new InvalidParamError("新郎或新娘数据不完整"));
    }

    var uid = userSession.uid;
    var weddingInfo = {};
    weddingInfo.userId = uid;
    weddingInfo.groomName = groomName;
    weddingInfo.brideName = brideName;

    User.createOneWedding(weddingInfo,function(err){
        if( err ){
            logger.debug(err);
            return next(err);
        }

        res.json({code:0,msg:"successful"});
    })
}




