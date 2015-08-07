
var config = require("../appConfig");
var mysql  = require("mysql");

var mysqlPool = null;

/**
 * init mysql pool
 * @return {null} 
 */
function initMysqlPool () {
    mysqlPool = mysql.createPool(config.db_mysqlConfig);
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
                return this.escape(values[key]);
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
exports.query = function (sqlReq, callback) {
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

        connectionQueryFormat(connection);

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
exports.startTransaction = function transaction(sqlReq,callback){
    if (!mysqlPool) {
        initMysqlPool();
    }

    mysqlPool.getConnection(function (err, connection) {

        if (err) {
            return callback(err);
        }

        connectionQueryFormat(connection);

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

            if (!sqlReq) {
                return rollback(new DBError("the sqlReq is null"),queryCallback);
            }

            var sql_pattern = sqlReq.sql || "";
            if (sql_pattern.length === 0) {
                return rollback(new DBError("the sql is empty"),queryCallback);
            }

            connection.query(sql_pattern, sqlReq.params, function (err, rows) {
                if( err ){
                    return rollback(err,queryCallback);
                }
                queryCallback(err,rows,query);
            });
        }

        query.rollbackTransaction = function(cb){
            rollback(null,cb);
        }

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

        connection.beginTransaction(function(err) {
            if( err ){
                return rollback(err,callback);
            }
            query(sqlReq,callback);
        });
    });
}





