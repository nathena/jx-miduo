/**
 * Created by xyliu on 15/1/24.
 */

var mysqlClient = require("../lib/sql");
var libUtils=new require('../lib/utils.js');


/**
 * 获取多宝娱开放的场景应用列表
 * @param callback
 * @returns 场景应用列表
 */
var sqlGetUserSceneList = "select * from d_scene";
exports.getSceneList = function getSceneList(callback) {
    var funcId = 'models.scene.getSceneList';
    logger.debug(funcId + ' debug: ');

    mysqlClient.query({
        sql: sqlGetUserSceneList,
        params: null
    }, function (err, rows) {
        if (err) {
            logger.error( funcId + ' error ===>' );
            callback(new ServerError(), null);
        }

        callback(null, rows);
    });
}