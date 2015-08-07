/**
 * Created by nathena on 15/1/21.
 */


/**
 * 用户管理员账号管理
 * @type {exports}
 */

var sql = require("../lib/sql");
var crypto = require("../lib/crypto");

var sql_adminAccountLogin = "";

/**
 * 管理员登陆
 * @param account
 * @param password
 * @param todo
 */
exports.login = function login(account,password,callback){

    sql.query(sql,function(err,row){

        if( err ){
            throw new ServerError(" 验证系统后台账号：用户名不存在 "+err.message);
        }

        checkPassword(row);
    });


    //验证账号密码,回调处理
    function checkPassword(row){

        if( !row ){
            throw new ServerError(" 验证系统后台账号：用户账号数据异常");
        }

        var passowrd = row["passowrd"]; //根据实际字段修改

        var saltPws = crypto.generatePaswordWithSalt(password,account); //根据实际加盐约定

        if( passowrd != saltPws ){
            callback(row,new ServerError("系统后台账号密码不正确"));
        }else{
            callback(row);
        }
    }

}


