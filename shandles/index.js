/**
 * Created by nathena on 15/1/22.
 */
var guest = require("../models/guest");
var scene = require("../models/scene");
var userScene = require("../models/userScene");


var sockets = {};
function autoDisconnect(socket){
    sockets[socket.id] = socket;
    setTimeout(function(){
        process.nextTick(function() {
            for( var i in sockets ){
                close(sockets[i]);
            }
        });
    },3000);

    function close(socket){
        try
        {
            socket.disconnect();
            delete sockets[socket.id];

            logger.debug(" >>>> delete socket "+socket.id+" > "+socket.request.connection.remoteAddress);
        }
        catch(ex){
            logger.error(ex.message);
        }
    }
}

module.exports = function(socket){

    logger.debug(" >>>>> "+socket.id);

    autoDisconnect(socket);

    //宾客登录
    socket.on("login",function(data){

        delete sockets[socket.id];

        socket._user = data;
        socket._wId = data.userId+data.weddingNo;
        socket._joinRoom = data.wId;
        socket._role = "guest";

        socket.join(socket._joinRoom);

        socket.to(socket._wId+"-ls").emit("guest login",data);

        //获取当前场景
        userScene.getCurOpenScene(socket._user.userId,socket._user.weddingNo,function(err,row){
            socket.emit("logined",row);
        });

        //持久化
        guest.add(data,function(err,data){});
    });

    socket.on("guest lazy login",function(){
        socket.to(socket._wId+"-ls").emit("guest lazy login",socket._user);
    });

    //宾客签到
    socket.on("sign",function(data){

        //TODO 从持久化中判断是否已经签到
        socket.emit("signed",data);
        //向大屏幕广播持久化的签到数据
        socket.to(socket._wId+"-ls").emit("guest sign",data);

        //持久化
        guest.saveGuestSignInfo(socket._user)
    })

    //宾客祝福语
    socket.on("wishText",function(data){
        socket.emit("wishTexted",data);
        //向大屏幕广播持久化的签到数据
        socket.to(socket._wId+"-ls").emit("guest wishText",data);

        //持久化
        guest.saveGuestWishTextInfo(data,function(err){});
    })

    //摇一摇
    socket.on("happyShake",function(data){
        socket.emit("happyShakeed",data);
        //向大屏幕广播持久化的签到数据
        socket.to(socket._wId+"-ls").emit("guest happyShake",data);

        //持久化
        guest.saveGuestHappyShakeInfo(data,function(err){});
    })

    //图拍
    socket.on("wishPic",function(data){
        socket.emit("wishPiced",data);
        //向大屏幕广播持久化的签到数据
        socket.to(socket._wId+"-ls").emit("guest wishPic",data);

        //TODO 持久化

    })

    //新人登陆
    socket.on("scLogin",function(data){

        delete sockets[socket.id];

        socket._user = data;
        socket._wId = data.userId+data.weddingNo;
        socket._joinRoom = data.wId+"-sc";
        socket._role = "sc";

        socket.join(socket._joinRoom);
        //获取当前场景
        userScene.getCurOpenScene(socket._user.userId,socket._user.weddingNo,function(err,row){
            socket.emit("scLogined",row);
        });
    });

    //场景切换
    socket.on("scSwich",function(data){

        socket.emit("scSwiched",data);
        socket.to(socket._wId+"-ls").emit("scSwiched",data);//大屏幕
        socket.to(socket._wId).emit("scSwiched",data);//宾客

        //持久化场景开始时间
        userScene.saveUserSceneSetting(socket._user.userId,data.sceneIds,function(err){});
    })

    //大屏幕连接
    socket.on("lsLogin",function(data){

        delete sockets[socket.id];

        socket._user = data;
        socket._wId = data.userId+data.weddingNo;
        socket._joinRoom = data.wId+"-ls";
        socket._role = "ls";

        socket.join(socket._joinRoom);

        //获取当前场景
        userScene.getCurOpenScene(socket._user.userId,socket._user.weddingNo,function(err,row){
            socket.emit("lsLogined",row);
        });
    })

    //断开连接
    socket.on("disconnect",function(){

        var role = socket._role;

        //用户断开连接
        if( "guest" == role ){
            socket.to(socket._wId+"-ls").emit("guest disconnect",socket._user);
        }else if( "ls" == role ){
            socket.to(socket._wId).emit("ls disconnect",socket._user);
            socket.to(socket._wId+"-sc").emit("ls disconnect",socket._user);
        }

    });

}

