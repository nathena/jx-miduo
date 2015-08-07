/**
 * Created by nathena on 15/7/8.
 */
var cfg = require("../appConfig");
var HttpUtil = require("./HttpUtil");
var DateTimeUtil = require("./DateTimeUtil");
var UUID = require("./UUID");
var crypto = require("./crypto");

var util = require("util");

var AppID = cfg.wxconfig.AppID;
var AppSecret = cfg.wxconfig.AppSecret;

var access_token_api = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s";
var jsapi_ticket_api = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi";

var site_access_code_state = "fangmmapi";
var site_access_code_api = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=%s&redirect_uri=%s&response_type=code&scope=%s&state=%s#wechat_redirect";
var openid_access_token_api = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code";
var refresh_token_api = "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=%s&grant_type=refresh_token&refresh_token=%s";
var userinfo_api = "https://api.weixin.qq.com/sns/userinfo?access_token=%s&openid=%s&lang=%s";
var check_openid = "https://api.weixin.qq.com/sns/auth?access_token=%s&openid=%s";

var snsapi_base = 'snsapi_base';
var snsapi_userinfo = 'snsapi_userinfo';
var zh_CN = 'zh_CN',zh_TW = 'zh_TW',en = 'en';


var Token = null,JsapiTicket = null;

/**
 * access_token是公众号的全局唯一票据
 * @param callback
 */
var accessToken = exports.accessToken = function accessToken(callback){

    callback = callback || function(){};

    if( !Token || ( Token["create_time"] && Token["create_time"] + Token["expires_in"] <= DateTimeUtil.getTimeStamp() ) ){

        var api = util.format(access_token_api,AppID,AppSecret);

        HttpUtil.get(api,null,function(err,response,body){
            if( err ){
                return callback(err);
            }

            try
            {
                var data = JSON.parse(body);
                var errcode = data["errcode"];
                if( errcode ){
                    return callback(new Error(data["errmsg"]));
                }

                data['create_time'] = DateTimeUtil.getTimeStamp();

                Token = data;

                callback(err,Token);
            }
            catch(ex)
            {
                callback(err);
            }
        })
    }
    else
    {
        callback(null,Token);
    }
}

/**
 * jsapi_ticket是公众号用于调用微信JS接口的临时票据
 * @param callback
 */
var jsapiTicket = exports.jsapiTicket = function jsapiTicket(callback){

    callback = callback || function(){};

    if( !JsapiTicket || ( JsapiTicket["create_time"] && JsapiTicket["create_time"] + JsapiTicket["expires_in"] <= DateTimeUtil.getTimeStamp() ) )
    {
        accessToken(function(err,token){

            var api = util.format(jsapi_ticket_api,token["access_token"]);
            HttpUtil.get(api,null,function(err,response,body){

                if( err ){
                    return callback(err);
                }

                try
                {
                    var data = JSON.parse(body);
                    var errcode = data["errcode"];
                    if( errcode!=0  ){
                        return callback(new Error(data["errmsg"]));
                    }

                    data['create_time'] = DateTimeUtil.getTimeStamp();

                    JsapiTicket = data;

                    callback(err,JsapiTicket);
                }
                catch(ex)
                {
                    callback(err);
                }
            })

        })
    }
    else
    {
        callback(null,JsapiTicket);
    }
}

/**
 *
 * jsapi_ticket是公众号用于调用微信JS接口的临时票据，并签名
 * @param url
 * @param callback
 */
exports.jsapiSignature = function jsapiSignature(url,callback){

    callback = callback || function(){};

    var noncestr = UUID.generateUUID(16);
    var timestamp = DateTimeUtil.getTimeStamp();

    jsapiTicket(function(err,_jsapiTicket){

        if( err ){
            return callback(err);
        }

        var signatureData = {};
        signatureData.noncestr = noncestr;
        signatureData.timestamp = timestamp;
        signatureData.url = url;
        signatureData.jsapi_ticket = _jsapiTicket["ticket"];

        var signatureKeys = [];
        Object.keys(signatureData).forEach(function(key){
            signatureKeys.push(key);
        })
        signatureKeys.sort();

        var signatureStr = "",symbol="";
        signatureKeys.forEach(function(key){
            signatureStr += symbol+key+"="+signatureData[key];
            symbol="&";
        })

        logger.debug(" signatureStr = "+signatureStr);

        var signature = crypto.sha1(signatureStr);

        logger.debug(" signature = "+signature);

        signatureData.signature = signature;
        signatureData.appId = AppID;

        callback(err,signatureData);
    })
}

/**
 * 发送accessToken
 * @param redirectUri
 */
exports.wxAccessToken = function(redirectUri){

    return function(req,res,next){
        var api = util.format(site_access_code_api,AppID,encodeURIComponent(redirectUri),snsapi_userinfo,site_access_code_state);
        res.redirect(api);
    }
}

/**
 * 回调accessToken
 * @returns {*}
 */
exports.wxLoadOpenidByCode = function(){

    return function(req,res,next){

        var code = req.query.code;
        if( !code ){
            return next(new DataNotFoundError());
        }

        logger.debug("  wxLoadOpenidByCode call "+req.query.code);

        var api = util.format(openid_access_token_api,AppID,AppSecret,code);

        logger.debug("  wxLoadOpenidByCode api "+api);

        //拿wxOpenid数据
        HttpUtil.get(api,null,function(err,response,body){

            if( err ){
                return next(err);
            }

            try
            {

                logger.debug("  wxLoadOpenidByCode body "+body);

                var data = JSON.parse(body);
                userInfo(data,loadUserInfo); //请求userinfo
            }
            catch(ex)
            {
                logger.error(ex.message);
                next(ex);
            }
        });


        function loadUserInfo(err,wxOpenid){

            if( err ){
                return next(err);
            }

            req.session._wxUser = wxOpenid;

            if( req.session.__accessTokenRedirect ){
                res.redirect(req.session.__accessTokenRedirect);
            }else{
                res.redirect("/");
            }
        }
    }
}


/**
 * 更加信息的用户信息
 * @param wxOpenid
 * @param callback
 */
function userInfo(wxOpenid,callback){

    var api = util.format(userinfo_api, wxOpenid["access_token"],wxOpenid["openid"],zh_CN);

    logger.debug("  userInfo api "+api);

    HttpUtil.get(api,null,function(err,response,body){

        if( err ){
            return callback(err);
        }

        try
        {

            logger.debug("  userInfo body "+body);

            //content = json
            var data = JSON.parse(body);

            wxOpenid.lang = zh_CN;
            wxOpenid.city =data.city;
            wxOpenid.province =data.province;
            wxOpenid.country =data.country;
            wxOpenid.headimgurl =data.headimgurl;
            wxOpenid.nickname =data.nickname;
            if( 2 == data.sex ){
                wxOpenid.sex = "female";
            }
            if( 1 == data.sex ){
                wxOpenid.sex = "male";
            }
            wxOpenid.privilege =data.privilege;
            wxOpenid.unionid =data.unionid;

            callback(null,wxOpenid);
        }
        catch(ex)
        {
            logger.error(ex);

            callback(ex);
        }
    });
}