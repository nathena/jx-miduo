
var config = require("../appConfig");
var mysql  = require("mysql");
var util   = require("util");

var mysqlPool = null;

/**
 * init mysql pool
 * @return {null} 
 */
function initMysqlPool () {
    mysqlPool = mysql.createPool(config.db_mysqlConfig);

    mysqlPool.on('connection', function (connection) {
        console.log(" connection ");
    });

    //mysqlPool.end(function (err) {
    //    // all connections in the pool have ended
    //});
}

/**
 * 格式化query
 * @param connection
 */
function connectionQueryFormat(connection){

    connection.config.queryFormat = function (query, values) {
        if (!values) return query;
        return query.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) {
                if( "object" == typeof values[key] ){
                    return this.escape(JSON.stringify(values[key]));
                }else{
                    return this.escape(values[key]);
                }
            }
            return txt;
        }.bind(this));
    };
}

/**
 * do mysql query
 * @param  {object}   sqlReq   the sql request obj
 * @param  {Function} callback the callback func
 * @return {null}            
 */
var query = exports.query = function query(sqlReq, callback) {
    //sql, params
    if (!mysqlPool) {
        initMysqlPool();
    }

    if (!sqlReq) {
        return callback(new DBError("the sqlReq is null"));
    }

    var sql_pattern = sqlReq.sql || "";
    if (sql_pattern.length === 0) {
        return callback(new DBError("the sql is empty"));
    }

    mysqlPool.getConnection(function (err, connection) {
        if (err) {
            return callback(err, null);
        }

        if( Array.isArray(sqlReq.params) ){
            connection.config.queryFormat = null;
        }else{
            connectionQueryFormat(connection);
        }


        connection.query(sql_pattern, sqlReq.params, function (err, rows) {
            connection.release();
            if( err ){
                return callback(new DBError(err.message));
            }
            return callback(err, rows);
        });
    });
}

/**
 * transaction(star);
 * function start(err,query){
 *
 * }
 * @param callback
 */
var transaction = exports.startTransaction = function transaction(sqlReq,callback){
    if (!mysqlPool) {
        initMysqlPool();
    }

    if (!sqlReq) {
        return callback(new DBError("the sqlReq is null"),queryCallback);
    }

    var sql_pattern = sqlReq.sql || "";
    if (sql_pattern.length === 0) {
        return callback(new DBError("the sql is empty"),queryCallback);
    }

    mysqlPool.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        connectionQueryFormat(connection);

        //回滚
        function rollback(err,cb){
            connection.rollback(function() {
                connection.release();
            });
            cb && cb(err);
        }

        /**
         *
         * function queryCallback(err,data,query)
         *
         * @param sqlReq
         * @param transaction
         * @returns {*}
         */
        function query(sqlReq,queryCallback){

            connection.query(sql_pattern, sqlReq.params, function (err, rows) {
                if( err ){
                    return rollback(err,queryCallback);
                }
                queryCallback(err,rows,query);
            });
        }

        /**
         * 提供给外部回滚
         * @param cb
         */
        query.rollbackTransaction = function(cb){
            rollback(null,cb);
        }

        /**
         * 提供给外部提交
         * @param failure
         * @param succeed
         */
        query.commitTransaction = function(failure,succeed){
            connection.commit(function(err) {
                if( err ){
                    query.rollbackTransaction();
                    failure && failure(err);
                    return;
                }
                connection.release();
                succeed && succeed();
            });
        }

        //自动启动事务
        connection.beginTransaction(function(err) {
            if( err ){
                return rollback(err,callback);
            }
            query(sqlReq,callback);
        });
    });
}

var insertSqlFormat = "INSERT INTO `%s` ( %s ) VALUES ( %s )";
exports.insert = function(table,bean,callback,_queryable){

    var $insertkeysql = "",$insertvaluesql = "",$comma = "";

    for(var key in bean){

        $insertkeysql += $comma + '`' +key + '`';
        $insertvaluesql += $comma+":"+key;

        $comma = ",";
    }

    var sql = util.format(insertSqlFormat,table,$insertkeysql,$insertvaluesql);
    logger.debug(sql);

    var sqlReq = {};
    sqlReq.sql = sql;
    sqlReq.params = bean;

    _queryable = _queryable || query;
    _queryable(sqlReq,callback);
}

var insertsSqlFormat = "INSERT INTO `%s` ( %s ) VALUES  %s ";
exports.inserts = function(table,beans,callback,_queryable){

    if( !Array.isArray(beans) && beans.length <= 0 ){
        return callback && callback(new Error("inserts 必须传递数组bean"));
    }

    var $insertkeysql = "",$insertvaluesql = "",$comma = "", $out="", $in = "";

    var $keys = beans[0];
    for(var key in $keys){
        $insertkeysql += $comma + '`' +key + '`';
        $comma = ",";
    }

    var values = [];
    beans.forEach(function(bean){

        $in = '';
        $insertvaluesql += $out + '(';

        for(var key in bean){

            $insertvaluesql += $in+"?";
            $in = ",";

            values.push(bean[key] || "");
        }

        $insertvaluesql += ')';
        $out = ","
    })

    var sql = util.format(insertsSqlFormat,table,$insertkeysql,$insertvaluesql);
    logger.debug(sql);

    var sqlReq = {};
    sqlReq.sql = sql;
    sqlReq.params = values;

    _queryable = _queryable || query;
    _queryable(sqlReq,callback);
}

var updateSqlFormat = "update `%s` set %s %s ";
exports.update = function(table,fileds,wheresql,callback,_queryable){

    var values = [];

    var $setsql = "",$comma = "";
    for(var key in fileds){

        $setsql += $comma + '`' +key + '` = ? ';
        $comma = ",";

        values.push(fileds[key] || "");
    }

    var $_where = "",$comma = '';
    if( typeof wheresql == "string"){
        $_where = wheresql;
    }else{
        for(var key in wheresql){

            $_where += $comma + '`' +key + '` = ? ';
            $comma = " and ";

            values.push(wheresql[key] || "");
        }
    }

    if( $_where ){
        $_where = " where "+$_where;
    }

    var sql = util.format(updateSqlFormat,table,$setsql,$_where);
    logger.debug(sql);

    var sqlReq = {};
    sqlReq.sql = sql;
    sqlReq.params = values;

    _queryable = _queryable || query;
    _queryable(sqlReq,callback);
}

var delSqlFormat = "DELETE FROM `%s` %s ";
exports.del = function(table,wheresql,callback,_queryable){

    var values = [];

    var $_where = "",$comma = '';
    if( typeof wheresql == "string"){
        $_where = wheresql;
    }else{
        for(var key in wheresql){

            $_where += $comma + '`' +key + '` = ? ';
            $comma = " and ";

            values.push(wheresql[key] || "");
        }
    }
    if( $_where ){
        $_where = " where "+$_where;
    }

    var sql = util.format(delSqlFormat,table,$_where);
    logger.debug(sql);

    var sqlReq = {};
    sqlReq.sql = sql;
    sqlReq.params = values;

    _queryable = _queryable || query;
    _queryable(sqlReq,callback);
}



