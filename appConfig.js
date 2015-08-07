/**
 * 项目配置文件
 * @type {{debug: boolean, name: string, giftname: string, description: string, version: string, site_static_host: string, session_secret: string, log4js: {appenders: *[], levels: {logInfo: string}}, db_default_max_conns: number, db_mysqlConfig: {host: string, user: string, password: string, database: string}, db_default_page_rows: number}}
 */
var path = require("path");

exports = module.exports = {

    debug: true,
    name: "婚礼场景系统",
    giftname: "米多",
    description: "mi duo",
    version: "0.1.0",

    site_static_host: "",

    cookie_prefix : "dby_",

    redis :{
        host: "192.168.2.139",
        port: 6379,
        db: 0 //Database index to use
    },

    session: {
        resave:false,
        saveUninitialized:false,
        secret: 'keyboard cat'
    },

    qqOauth :{
        appid:"101188724",
        appkey:"0cb22eeaf5344eed156e22b454401b75",
        callback:""
    },
    weiboOauth:{
        appid:"2949038831",
        appkey:"b2aacde3a5243ed475166858ef30595b",
        callback:""
    },

    log4js: {
        "category": "console",
        "appenders": [
            // 下面一行应该是用于跟express配合输出web请求url日志的
            {"type": "console", "category": "console"},
            // 定义一个日志记录器
            {
                "type": "dateFile",                // 日志文件类型，可以使用日期作为文件名的占位符
                "filename": path.join(__dirname,'logs',"/"),    // 日志文件名，可以设置相对路径或绝对路径
                maxLogSize: 1024,
                "pattern": "info-yyyyMMdd.txt",    // 占位符，紧跟在filename后面
                "absolute": true,                  // filename是否绝对路径
                "alwaysIncludePattern": true,      // 文件名是否始终包含占位符
                "category": "logInfo"              // 记录器名
            }],
        "levels": {"logInfo": "DEBUG"}        // 设置记录器的默认显示级别，低于这个级别的日志，不会输出
    },

    //mysql max connections
    db_default_max_conns: 50,

    db_mysqlConfig: {
        "host": "192.168.2.139",
        "user": "root",
        "password": "",
        "database": "ejqdb"
    },

    // db_mysqlConfig       : {
    //     "host"      : "127.0.0.1",
    //     "user"      : "root",
    //     "password"  : "xyl@mysql",
    //     "database"  : "ejqdb"
    // },

    mail_opts           : {
        host  : "smtp.163.com",
        port  : 25,
        auth  : {
            user  : "wisasset@163.com",
            pass  : "adminn"
        }
    },

    db_default_page_rows: 50

};