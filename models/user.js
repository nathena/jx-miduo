var mysqlClient = require("../lib/sql");
var libUtils=new require('../lib/utils.js');

//sql statements
var sqlGetAllUsers = "select * from d_user";


/**
 * 根据email，获取用户信息
 * @type {string}
 */
var sqlGetUserByMobile = "select * from d_user where email = :email";
exports.getUserInfoByEmail = function getUserInfoByEmail(email, callback) {
    var funcId = 'models.user.getUserInfoByEmail';

    email = email || "";
    logger.debug(funcId + ' debug:  email=' + email);

    if (email.length === 0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql: sqlGetUserByMobile,
        params: {
            "email": email
        }
    }, function (err, rows) {
        if (err) {
            logger.error( funcId + ' error ===>' );
            callback(new ServerError(), null);
        }

        if (rows && rows.length > 0) {
            callback(null, rows[0]);
        } else {
            logger.error( funcId + ' error ===>' );
            callback(new DataNotFoundError(), null);
        }
    });
}


/**
 * Email登录验证，login By Email
 * @param email
 * @param encryPwd
 * @param callback
 * @returns 用户信息
 */
var sqlLoginByEmail = "SELECT * FROM d_user WHERE email = :email AND encry_pwd = :encryPwd";
exports.loginByEmail = function loginByEmail(email,encryPwd, callback) {
    var funcId = 'models.user.loginByEmail';

    email = email || "";
    encryPwd = encryPwd || "";

    logger.debug(' email:  ' + email);

    if (email.length === 0 || encryPwd.length === 0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql: sqlLoginByEmail,
        params: {
            "email": email,
            "encryPwd": encryPwd
        }
    }, function (err, rows) {
        if (err) {
            logger.error( funcId + ' error ===>' );
            callback(new ServerError(), null);
        }

        if (rows && rows.length > 0) {
            callback(null, rows[0]);
        } else {
            logger.error( funcId + ' error ===>' );
            callback(new DataNotFoundError(), null);
        }
    });
}


/**
 * 第三方账号登录验证，login By OpenId
 * @param openId
 * @param openPlat
 * @param callback
 * @returns 用户信息
 */
var sqlLoginByOpenId = "SELECT * FROM d_user WHERE open_id = :openId AND open_plat_type = :openPlatType";
exports.loginByOpenId = function loginByOpenId(openId,openPlat, callback) {
    var funcId = 'models.user.loginByOpenId';

    openId = openId || "";
    openPlat = openPlat || "";

    logger.debug(funcId + ' debug >> openId:  ' + openId);

    if (openId.length === 0 || openPlat.length===0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql: sqlLoginByOpenId,
        params: {
            "openId": openId,
            "openPlatType": openPlat
        }
    }, function (err, rows) {
        if (err) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError(), null);
        }

        if (rows && rows.length > 0) {
            return callback(null, rows[0]);
        } else {
            logger.error( funcId + ' error ===>' );
            return callback(new DataNotFoundError(), null);
        }
    });
}


/**
 * add a new user
 * @param {Object}   userInfo the inserting model of User
 * @param {Function} callback the call back func
 */
var sqlAddOneUser = "INSERT INTO d_user(uid, email, encry_pwd, reg_time, open_id, open_plat_type) " +
    " VALUES(:uid, :email, :encryPwd, :regTime, :openId, :openPlatType);";
exports.add = function add(userInfo, callback) {
    var funcId = 'models.user.add';
    logger.debug(funcId + ' debug >> userInfo:  ' + userInfo);

    var param    = userInfo || {};
    if (!param.email || !param.encryPwd) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    param.uid = libUtils.utils.getGuid();
    param.regTime = new Date();
    param.openId = param.openId || '';
    param.openPlatType = param.openPlatType || '';

    mysqlClient.query({
        sql       : sqlAddOneUser,
        params    : param
    },  function (err, rows) {
        if (err || !rows || rows.affectedRows === 0) {
            logger.error( funcId + ' error ===>' );
            return callback(new DBError(), null);
        }

        callback(null, null);
    });
}



/**
 * add a new user， must create only wedding
 * @param {Object}   userInfo the inserting model of User
 * @param {Function} callback the call back func
 */
var sqlAddUser = "INSERT INTO d_user(uid, email, encry_pwd, reg_time, open_id, open_plat_type) " +
    " VALUES(:uid, :email, :encryPwd, :regTime, :openId, :openPlatType);";
var sqlCreateFirstWedding = "INSERT INTO d_user_wedding (id, user_id, wedding_no,groom_name, bride_name, wed_date,create_time," +
    "ls_login_path,qrcode_scene_ctrl,qrcode_scene_ctrl_txt,qrcode_guest,qrcode_guest_txt) " +
    " VALUES(:id, :userId, :weddingNo, :groomName, :brideName,:wedDate,:createTime," +
    ":lsLoginPath,:qrcodeSceneCtrl,:qrcodeSceneCtrlTxt,:qrcodeGuest,:qrcodeGuestTxt);";
exports.addWithWeddingInfo = function addWithWeddingInfo(userInfo,callback) {
    var funcId = 'models.user.addWithWeddingInfo';
    logger.debug(funcId + ' userInfo:  ' + JSON.stringify(userInfo));

    var param    = userInfo || {};
    param.email = userInfo.email || '';
    param.encryPwd = userInfo.encryPwd || '';
    param.groom = userInfo.groom || '';
    param.bride = userInfo.bride || '';
    param.wedDate = userInfo.wedDate || '';

    if (param.email.length === 0 || param.encryPwd.length === 0 ||
        param.encryPwd.groom === 0 || param.bride.length === 0 ||
        param.wedDate.length === 0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError());
    }

    param.uid = libUtils.utils.getGuid();
    param.regTime = new Date();
    param.openId = param.openId || '';
    param.openPlatType = param.openPlatType || '';


    var sqlReq_AddUser = {
        sql: sqlAddUser,  //
        params: param
    };

    //先增加用户
    mysqlClient.startTransaction( sqlReq_AddUser,createOneWedding );


    //再 创建一场婚礼
    function createOneWedding(err,rows,query){
        errHandle(err,callback,query,'AddUser');

        param.userId = param.uid;

        param.id = libUtils.utils.getGuid();
        param.weddingNo = 0;   // 第 1 场婚礼
        param.createTime = new Date();

        //生成 二维码 信息
        param.lsLoginPath = '/ls/';
        param.qrcodeSceneCtrl = '/qrcode/sc/';  //二维码图片地址
        param.qrcodeSceneCtrlTxt = '';
        param.qrcodeGuest = '/qrcode/guest/';
        param.qrcodeGuestTxt = '';

        var sqlReq_CreateFirstWedding = {
            sql: sqlCreateFirstWedding,
            params: param
        };

        query(sqlReq_CreateFirstWedding,doCommitTrans);

    }

    //提交事务,返回 回调
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'addWithWeddingInfo');
        query.commitTransaction();
        return callback();
    }


    function errHandle(err,callback,query,errorFuncId){
        if (err) {
            logger.error( funcId + ' ' + errorFuncId + ' error ===>' );
            query.rollbackTransaction();
            return callback(err);
        }
    }

}


/**
 * check user exists
 * @param  {String}   email      the user's email
 * @param  {Function} callback the cb func
 * @return {null}
 */
var sqlCheckUserExistByEmail = "SELECT COUNT(1) as 'count' FROM d_user WHERE email = :email";
exports.checkUserExistByEmail = function checkUserExistByEmail(email, callback) {
    var funcId = 'models.user.checkUserExistByEmail';

    logger.debug(funcId + ' debug >> email: ' + email);

    if (!email || email.length === 0) {
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql     : sqlCheckUserExistByEmail,
        params  : { email : email }
    },  function (err, rows) {
        if (err || !rows) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError(), null);
        }

        return callback(null, rows[0].count != 0);
    });
}


/**
 * modify password
 * @param  {Object}   userInfo the new password info
 * @param  {Function} callback the cb func
 * @return {null}
 */
var sqlModifyPassword = "UPDATE d_user SET encry_pwd = :encryPwd WHERE uid = :uid";
exports.modifyPwd = function modifyPwd(uid, encryNewPwd, callback) {
    var funcId = 'models.user.modifyPwd';
    logger.debug(funcId + " debug >> userInfo: " + userInfo );

    encryNewPwd = encryNewPwd || '';
    uid = uid || '';
    if (uid.length === 0 || encryNewPwd.length === 0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql     : sqlModifyPassword,
        params  : {
            "uid": uid,
            "encryPwd": encryNewPwd
        }
    },  function (err, rows) {
        if (err || !rows) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError(), null);
        }

        return callback(null, null);
    });
}


/**
 * modify last login time
 * @param  {Object}   userInfo the modifying user info
 * @param  {Function} callback the cb func
 * @return {null}
 */
var sqlModifyLoginInfo = "UPDATE d_user SET lst_login_time = :lstLoginTime,lst_ip = :lstIp WHERE uid = :uid";
exports.modifyLastLoginInfo = function (lstLoginInfo, callback) {
    var funcId = 'models.user.modifyLastLoginInfo';

    logger.debug(funcId + " debug >> lstLoginInfo: " + lstLoginInfo );

    mysqlClient.query({
        sql     : sqlModifyLoginInfo,
        params  : lstLoginInfo
    },  function (err, rows) {
        if (err || !rows) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError(), null);
        }

        return callback(null, null);
    });
}


/**
 * 创建 一场 婚礼
 * @param {Object}   guestInfo the inserting model of Guest
 * @param {Function} callback the call back func
 */
var sqlUserWeddingCount = "SELECT COUNT(1) as 'count' FROM d_user_wedding WHERE user_id = :userId;";
var sqlUserWeddingInsert = "INSERT INTO d_user_wedding (id, user_id, wedding_no,groom_name, bride_name, wed_date,create_time," +
    "ls_login_path,qrcode_scene_ctrl,qrcode_scene_ctrl_txt,qrcode_guest,qrcode_guest_txt) " +
    " VALUES(:id, :userId, :weddingNo, :groomName, :brideName,:wedDate,:createTime," +
    ":lsLoginPath,:qrcodeSceneCtrl,:qrcodeSceneCtrlTxt,:qrcodeGuest,:qrcodeGuestTxt);";
exports.createOneWedding = function createOneWedding(weddingInfo,callback) {
    var funcId = 'models.user.createOneWedding';
    logger.debug(funcId + " debug >> weddingInfo: " + weddingInfo );

    var param    = weddingInfo || {};
    param.userId = weddingInfo.userId||'';
    param.groomName = weddingInfo.groomName || '';
    param.brideName = weddingInfo.brideName || '';

    if (param.userId.length===0 || param.groomName===0 || param.brideName===0 || !weddingInfo.wedDate) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError());
    }

    var sqlReq_UserWeddingCount = {
        sql: sqlUserWeddingCount,  //
        params: {
            "userId": param.userId
        }
    };
    mysqlClient.startTransaction( sqlReq_UserWeddingCount,insertUserWedding );

    //insert
    function insertUserWedding(err,rows,query){
        errHandle(err,callback,query,'insertUserWedding');

        var count = 0;
        if(rows && rows.length>0){
            count = rows[0]['count'];
        }

        param.id = libUtils.utils.getGuid();
        param.weddingNo = count;   // 第 几 场婚礼
        param.wedDate = weddingInfo.wedDate;
        param.createTime = new Date();

        //生成 二维码 信息
        param.lsLoginPath = '/ls/';
        param.qrcodeSceneCtrl = '/qrcode/sc/';  //二维码图片地址
        param.qrcodeSceneCtrlTxt = '';
        param.qrcodeGuest = '/qrcode/guest/';
        param.qrcodeGuestTxt = '';

        var sqlReq_InsertUserWeddingInfo = {
            sql: sqlUserWeddingInsert,  //
            params: param
        };

        query(sqlReq_InsertUserWeddingInfo,doCommitTrans);

    }

    //提交事务
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'insertUserWedding');
        logger.debug('insertUserWedding done.');
        query.commitTransaction();
        return callback();
    }


    function errHandle(err,callback,query,errorFuncId){
        if (err) {
            logger.error( funcId + ' ' + errorFuncId + ' error ===>' );
            query.rollbackTransaction();
            return callback(err);
        }
    }

}

/**
 * 修改婚礼，主要是修改： 新郎、新娘、婚礼日期 等信息
 * @param  {Object}   userInfo the modifying user info
 * @param  {Function} callback the cb func
 * @return {null}
 */
var sqlModifyWeddingInfo = "UPDATE d_user SET groom_name = :groomName,bride_name = :brideName,wed_date = :wedDate WHERE uid = :uid AND wedding_no=:weddingNo";
exports.modifyWeddingInfo = function (weddingInfo, callback) {
    var funcId = 'models.user.modifyWeddingInfo';
    logger.debug(funcId + " debug >> weddingInfo: " + weddingInfo );

    var param    = weddingInfo || {};
    param.uid = weddingInfo.uid || '';
    param.groomName = weddingInfo.groomName || '';
    param.brideName = weddingInfo.brideName || '';
    param.weddingNo = weddingInfo.weddingNo || 0;   //默认 第0场婚礼


    if (param.uid.length===0 || param.groomName===0 || param.brideName===0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError());
    }

    param.wedDate = weddingInfo.wedDate || new Date();

    mysqlClient.query({
        sql     : sqlModifyWeddingInfo,
        params  : param
    },  function (err, rows) {
        if (err || !rows) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError());
        }

        return callback();
    });
}
