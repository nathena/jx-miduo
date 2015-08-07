/**
 * Created by xyliu on 15/1/24.
 */


var mysqlClient = require("../lib/sql");
var libUtils=new require('../lib/utils.js');

var Scene = require("./scene.js");



/**
 * 根据uid，获取用户配置的场景应用列表
 * @param uid
 * @param callback
 * @returns 用户信息
 */
var sqlGetUserSceneList = "select * from d_user_scene where user_id = :uid AND wedding_no=:weddingNo";
exports.getUserSceneList = function getUserSceneList(uid,weddingNo, callback) {
    var funcId = 'models.userScene.getUserSceneList';

    uid = uid || "";
    logger.debug(funcId + ' debug:  uid=' + uid);

    if (uid.length === 0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql: sqlGetUserSceneList,
        params: {
            "uid": uid,
            'weddingNo':weddingNo||0
        }
    }, function (err, rows) {
        if (err) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError(), null);
        }


            //callback(null, rows);
            Scene.getSceneList(function(err,scenes){
                if (err) {
                    logger.error( funcId + ' Scene.getSceneList error ===>' );
                    return callback(err,null);
                }
                if (scenes && scenes.length > 0) {

                    var userSceneList = [];
                    scenes.forEach(function (scene, callback) {
                        var userScene = {
                            "id"   : scene['id'],
                            "name" : scene['name'],
                            "icon" : scene['icon_path'],
                            "title": scene['title'],
                            "selected": false
                        };

                        if (rows && rows.length > 0) {
                            for (var i in rows) {
                                if (rows[i]['scene_id'] === userScene.id) {
                                    userScene.selected = true;
                                    break;
                                }
                            }
                            ;
                        }

                        userSceneList.push(userScene);
                    });

                    callback(null,userSceneList);
                }
            });



    });
}


/**
 * 婚礼场景的基本信息，
 * @param uid
 * @param callback
 * @returns
 */
var sqlGetWeddingSceneInfo = "SELECT * FROM d_user WHERE uid = :uid";
exports.getWeddingSceneInfo = function getWeddingSceneInfo(uid,weddingNo,callback) {
    var funcId = 'models.userScene.getWeddingSceneInfo';

    uid = uid || "";
    logger.debug(funcId + ' uid:  ' + uid);

    if (uid.length === 0 ) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError(), null);
    }

    mysqlClient.query({
        sql: sqlGetWeddingSceneInfo,
        params: {
            "uid": uid
        }
    }, function (err, rows) {
        if (err) {
            logger.error( funcId + ' error ===>' );
            callback(new ServerError(), null);
        }

        if (rows && rows.length > 0) {
            var weddingSceneInfo = {
                "uid"   : rows[0]['uid'],
                "groom" : rows[0]['groom_name'],
                "bride" : rows[0]['bride_name'],
                "wedDate": rows[0]['wed_date'],
                //"qrcodeGuest" : rows[0]['qrcode_guest'],
                "qrcodeScPath" : rows[0]['qrcode_scene_ctrl'],
                "lsLoginPath": rows[0]['ls_login_path']
            };
            callback(null, weddingSceneInfo);
        } else {
            logger.error( funcId + ' error ===>' );
            callback(new DataNotFoundError(), null);
        }
    });
}

/**
 * 婚礼场景应用的开关，
 * @param uid
 * @param callback
 * @returns
 */
var sqlDeleteUserSceneSetting = "DELETE FROM d_user_scene WHERE user_id = :uid";
var sqlInsertUserSceneSetting = "INSERT INTO d_user_scene (id, user_id, scene_id) VALUES";
    //+ "(:id, :uid, :sceneId);";
exports.saveUserSceneSetting = function saveUserSceneSetting(uid,sceneIds,callback) {
    var funcId = 'models.userScene.saveUserSceneSetting';

    uid = uid || "";

    logger.debug(funcId + ' uid:  ' + uid + ' sceneIds:  ' + sceneIds );

    if (uid.length === 0 ) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError());
    }

    var sqlReqDeleteOldSceneSetting = {
        sql: sqlDeleteUserSceneSetting,  //
        params: {
            "uid": uid
        }
    };

    mysqlClient.startTransaction( sqlReqDeleteOldSceneSetting,insertNewSceneSetting );


    //清除后 insert new
    function insertNewSceneSetting(err,rows,query){
        sceneIds = sceneIds || [];
        if(sceneIds.length===0){
            logger.debug('cbAfterDeleteUserSceneSetting return insert none.');
            query.commitTransaction();
            return callback();
        }

        errHandle(err,callback,query,'cbAfterDeleteUserSceneSetting');

        //构建 查询sql及其参数
        function buildSqlReqForInsertNewSceneSetting() {
            var params = {
                "uid": uid
            };
            for (var i in sceneIds) {
                sqlInsertUserSceneSetting += " (:id" + i + ", :uid, :sceneId" + i + ")";
                if (i < sceneIds.length - 1)
                    sqlInsertUserSceneSetting += ",";
                else
                    sqlInsertUserSceneSetting += ";";
                params['id' + i] = libUtils.utils.getGuid();
                params['sceneId' + i] = sceneIds[i];
            }
            var sqlReqInsertNewSceneSetting = {
                sql: sqlInsertUserSceneSetting,
                params: params
            };
            return sqlReqInsertNewSceneSetting;
        }

        query(buildSqlReqForInsertNewSceneSetting(),doCommitTrans);

    }

    //提交事务
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'insertUserSceneSetting');
        logger.debug('insertUserSceneSetting return rows:' + rows);
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
 * 获取 当前进行中的场景应用
 * @param callback
 * @returns 场景应用列表
 */
var sqlGetCurOpenUserScene = "select * from d_user_scene where user_id = :userId AND wedding_no=:weddingNo " +
    "AND start_time is not null AND end_time is null order by order_no";
exports.getCurOpenScene = function getCurOpenScene(userId,weddingNo,callback) {
    var funcId = 'models.userScene.getCurOpenScene';
    logger.debug(funcId + ' debug: ');

    mysqlClient.query({
        sql: sqlGetCurOpenUserScene,
        params: {
            'userId':userId,
            'weddingNo':weddingNo||0
        }
    }, function (err, rows) {
        if (err) {
            logger.error( funcId + ' error ===>' );
            return callback(new ServerError(), null);
        }

        if(!rows || rows.length===0){
            logger.error( funcId + ' error ===>' );
            return callback(new DataNotFoundError());
        }

        return callback(null, rows[0]);
    });
}


/**
 * 切换 某 婚礼场景应用  ，
 * @param uid
 * @param callback
 * @returns
 */
var sqlCloseOpenedScene = "UPDATE d_user_scene SET end_time = :endTime WHERE user_id = :userId AND wedding_no=:weddingNo " +
              "AND start_time is not null AND end_time is null";
var sqlOpenWeddingScene = "UPDATE d_user_scene SET start_time = :startTime WHERE user_id = :userId AND wedding_no=:weddingNo AND scene_id=:openSId";
exports.switchWeddingScene = function switchWeddingScene(wsSwitchInfo,callback) {
    var funcId = 'models.userScene.openWeddingScene';
    logger.debug(funcId + ' wsSwitchInfo:  ' + JSON.stringify(wsSwitchInfo));

    var param    = wsSwitchInfo || {};
    param.userId = wsSwitchInfo.userId || '';

    if (param.userId.length === 0) {
        logger.error( funcId + ' error ===>' );
        return callback(new InvalidParamError());
    }

    param.weddingNo = wsSwitchInfo.weddingNo || 0;
    param.endTime = new Date();

    var sqlReq_CloseOpenedScene = {
        sql: sqlCloseOpenedScene,  //
        params: param
    };

    //先关闭 所有已打开的场景应用
    mysqlClient.startTransaction( sqlReq_CloseOpenedScene,openNewScene );


    //再 打开指定的场景应用
    function openNewScene(err,rows,query){
        errHandle(err,callback,query,'CloseOpenedScene');

        param.openSId = wsSwitchInfo.openSId || '';
        if(param.openSId.length===0){
            logger.debug('openNewScene return: none scene is opened.');
            query.commitTransaction();   //提交事务,返回 回调
            return callback();
        }

        param.startTime = new Date();
        var sqlReq_OpenNewScene = {
            sql: sqlOpenWeddingScene,
            params: param
        };

        query(sqlReq_OpenNewScene,doCommitTrans);

    }

    //提交事务,返回 回调
    function doCommitTrans(err,rows,query){
        errHandle(err,callback,query,'OpenNewScene');
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