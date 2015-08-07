/**
 * 宾客管理
 * Created by xyliu on 15/1/26.
 */


var mysqlClient = require("../lib/sql");
var libUtils=new require('../lib/utils.js');

/**
 * 增加 宾客
 * @param {Object}   guestInfo the inserting model of Guest
 * @param {Function} callback the call back func
 */
var sqlAddGuest = "INSERT INTO d_guest(id, user_id, open_id, open_plat_type,wedding_no, nickname, avatar_path,created_time) " +
    " VALUES(:id, :userId, :openId, :openPlatType,:weddingNo, :nickname, :avatarPath, :createdTime);";
exports.add = function add(guestInfo, callback) {
    var funcId = 'models.guest.add';
    logger.debug(funcId + ' debug >> guestInfo:  ' + guestInfo);

    var param    = guestInfo || {};
    if (!param.userId || !param.openId) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    param.id = libUtils.utils.getGuid();
    param.createdTime = new Date();
    param.openPlatType = param.openPlatType || '';
    param.nickname = param.nickname || '';
    param.avatarPath = param.avatarPath || '';
    param.weddingNo = param.weddingNo || 0;

    mysqlClient.query({
        sql       : sqlAddGuest,
        params    : param
    },  function (err, rows) {
        if (err || !rows || rows.affectedRows === 0) {
            logger.error( funcId + ' error ===>' );
            return callback(new DBError(), null);
        }

        callback(null,param);
    });
}


/**
 * check guest if signed
 * @param  {String}   userId      the user's id
 * @param  {String}   guestId      the guest's id
 * @param  {Function} callback the cb func
 * @return {null}
 */
var sqlCheckGuestIfSigned = "SELECT COUNT(1) as 'count' FROM d_guest_sign WHERE user_id = :userId AND open_id = :openId AND wedding_no = :weddingNo ";
exports.checkGuestIfSigned = function checkGuestIfSigned(userId,openId,weddingNo, callback) {
    var funcId = 'models.guest.checkGuestIfSigned';
    logger.debug(funcId + ' debug >> email: ' + email);

    userId = userId || '';
    openId = openId || '';
    if (userId.length === 0 || openId.length === 0) {
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql     : sqlCheckGuestIfSigned,
        params  : {
            'userId' : userId,
            'openId': openId,
            'weddingNo': weddingNo||0
        }
    },  function (err, rows) {
        if (err || !rows) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError(), null);
        }

        return callback(null, rows[0].count != 0);
    });
}


/**
 * 宾客 签到
 * @param {Object}   guestInfo the inserting model of Guest
 * @param {Function} callback the call back func
 */
var sqlGuestSignCount = "SELECT COUNT(1) as 'count' FROM d_guest_sign WHERE user_id = :userId;";
var sqlGuestSignInsert = "INSERT INTO d_guest_sign (id, user_id, open_id, sign_time, sign_no) " +
    " VALUES(:id, :userId, :openId, :signTime, :signNo);";
exports.saveGuestSignInfo = function saveGuestSignInfo(userId,openId,weddingNo,callback) {
    var funcId = 'models.guest.saveGuestSignInfo';

    userId = userId || "";

    logger.debug(funcId + ' userId:  ' + userId + ' openId:  ' + openId );

    if (userId.length === 0 ) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError());
    }

    var sqlReq_GuestSignCount = {
        sql: sqlGuestSignCount,  //
        params: {
            "userId": userId
        }
    };

    mysqlClient.startTransaction( sqlReq_GuestSignCount,insertGuestSignInfo );


    //insert guest sign info
    function insertGuestSignInfo(err,rows,query){
        errHandle(err,callback,query,'insertGuestSignInfo');

        var signedCount = 0;
        if(rows && rows.length>0){
            signedCount = rows[0]['count'];
        }


        var sqlReq_InsertGuestSignInfo = {
            sql: sqlGuestSignInsert,  //
            params: {
                'id': libUtils.utils.getGuid(),
                'userId': userId,
                'openId': openId,
                'weddingNo': weddingNo||0,
                'signTime': new Date(),
                'signNo':signedCount+1
            }
        };

        query(sqlReq_InsertGuestSignInfo,doCommitTrans);

    }

    //提交事务
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'insertGuestSignInfo');
        logger.debug('insertGuestSignInfo done.');
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
 * 宾客 发送 祝福语
 * @param {Object}
 * @param {Function} callback the call back func
 */
var sqlGuestWishTextInsert = "INSERT INTO d_guest_wish_text (id, user_id, open_id, wedding_no, wish_text, create_time) " +
    " VALUES(:id, :userId, :openId,:weddingNo, :wishText, :createime);";
exports.saveGuestWishTextInfo = function saveGuestWishTextInfo(wishTextInfo,callback) {
    var funcId = 'models.guest.saveGuestWishTextInfo';
    logger.debug(funcId + ' wishTextInfo:  ' + JSON.stringify(wishTextInfo));

    var param    = wishTextInfo || {};
    if (!param.userId || !param.openId || !param.wishText) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    param.id = libUtils.utils.getGuid();
    param.weddingNo = wishTextInfo.weddingNo || 0;
    param.createdTime = new Date();


    var sqlReq_GuestWishTextInsert = {
        sql: sqlGuestWishTextInsert,  //
        params: param
    };

    mysqlClient.startTransaction( sqlReq_GuestWishTextInsert,doCommitTrans );

    //提交事务
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'insertGuestSignInfo');
        logger.debug('insertGuestSignInfo done.');
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
 * 宾客 发送 幸福摇
 * @param {Object}
 * @param {Function} callback the call back func
 */
var sqlGuestHappyShakeInsert = "INSERT INTO d_guest_wish_shake (id, user_id, open_id, wedding_no, shake_val, create_time) " +
    " VALUES(:id, :userId, :openId,:weddingNo, :shakeVal, :createime);";
exports.saveGuestHappyShakeInfo = function saveGuestWishTextInfo(happyShakeInfo,callback) {
    var funcId = 'models.guest.sqlGuestHappyShakeInsert';
    logger.debug(funcId + ' happyShakeInfo:  ' + JSON.stringify(happyShakeInfo));

    var param    = happyShakeInfo || {};
    if (!param.userId || !param.openId || !param.shakeVal) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    param.id = libUtils.utils.getGuid();
    param.weddingNo = happyShakeInfo.weddingNo || 0;
    param.createdTime = new Date();


    var sqlReq_GuestHappyShakeInsert = {
        sql: sqlGuestHappyShakeInsert,  //
        params: param
    };

    mysqlClient.startTransaction( sqlReq_GuestHappyShakeInsert,doCommitTrans );

    //提交事务
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'insertGuestHappyShake');
        logger.debug('insertGuestHappyShake done.');
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
 * 宾客 发送 祝福拍
 * @param {Object}
 * @param {Function} callback the call back func
 */
var sqlGuestWishPicInsert = "INSERT INTO d_guest_wish_pic (id, user_id, open_id, wedding_no, wish_pic_path, create_time) " +
    " VALUES(:id, :userId, :openId,:weddingNo, :wishPicPath, :createime);";
exports.saveGuestWishPicInfo = function saveGuestWishTextInfo(wishPicInfo,callback) {
    var funcId = 'models.guest.saveGuestWishPicInfo';
    logger.debug(funcId + ' wishPicInfo:  ' + JSON.stringify(wishPicInfo));

    var param    = wishPicInfo || {};
    if (!param.userId || !param.openId || !param.wishPicPath) {
        logger.err( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    param.id = libUtils.utils.getGuid();
    param.weddingNo = wishPicInfo.weddingNo || 0;
    param.createdTime = new Date();


    var sqlReq_GuestWishPicInsert = {
        sql: sqlGuestWishPicInsert,  //
        params: param
    };

    mysqlClient.startTransaction( sqlReq_GuestWishPicInsert,doCommitTrans );

    //提交事务
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'insertGuestWishPic');
        logger.debug('insertGuestWishPic done.');
        query.commitTransaction();
        return callback();
    }


    function errHandle(err,callback,query,errorFuncId){
        if (err) {
            logger.err( funcId + ' ' + errorFuncId + ' error ===>' );
            query.rollbackTransaction();
            return callback(err);
        }
    }

}
