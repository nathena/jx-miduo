/**
 * Created by nathena on 15/1/21.
 */

var io = require('socket.io');
var redis = require('socket.io-redis');
var appConfig = require("../appConfig");

exports.bind  = function(srv){
    var server = io.listen(srv);
    //server.adapter(redis({ host: appConfig.redis.host, port: appConfig.redis.port }));
    server.on("connection",function(socket){
        require("../shandles/")(socket);
    })

    logger.debug(" ..... socket bind >>> ");
};
