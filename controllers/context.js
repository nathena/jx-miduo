/**
 * Created by nathena on 15/1/23.
 */

var authentication = exports.authentication = function authentication(req){
    var session = req.session._userSession;
    if( !session || session.ip != req.ip ){
        return false;
    }
    return true;
}

var requireJsonFormat = exports.requireJsonFormat = function requireJsonFormat(req,res,next){
    req.isJsonFormat = true;
    next && next();
}

exports.requireAuthentication = function requireAuthentication(req,res,next){
    //验证session信息
    if( !authentication(req) ){
        res.render("/user/login.html");
        return;
    }
    next(); //true;
}

exports.requireRestAuthentication = function requireRestAuthentication(req,res,next){

    if( !authentication(req) ){
        res.json({code:0,msg:"用户令牌不正确"});
        return;
    }
    next();
}

exports.initContextSession = function initContextSession(uid,email,req){
    req.session.__UserSession = new UserSession(uid,email,req.ip);
}

exports.getContextSession = function getContextSession(req){
    return req.session.__UserSession;
}

exports.destroyContextSession = function destroyContextSession(req){
    req.session.destroy();
}

function UserSession(uid,email,ip){
    this.uid = uid;
    this.email = email;
    this.ip = ip
}

