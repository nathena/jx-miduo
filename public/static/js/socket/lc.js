/**
 * Created by nathena on 15/1/26.
 */

var Lc = {
    socket : null,
    accept : function(options){

        for( var i in options ){
            if( "socket" == i || "accept" == i){
                continue;
            }
            this[i] = options[i];
        }

        var that = this;
        var socket = this.socket = io.connect();

        function fireEvent(event,data){
            return that[event] && that[event].bind(socket,data);
        }

        //以下为默认事件
        socket.on("connecting",function(data){
            fireEvent("connecting",data);
        });

        socket.on("connect",function(data){
            socket.emit("scLogin",fireEvent("connect",data));
        });

        socket.on("connect_failed",function(data){
            fireEvent("connect_failed",data);
        });

        socket.on("error",function(data){
            fireEvent("error",data);
        });

        socket.on("message",function(data){
            fireEvent("message",data);
        });

        socket.on("anything",function(data){
            fireEvent("anything",data);
        });

        socket.on("reconnect_failed",function(data){
            fireEvent("reconnect_failed",data);
        });

        socket.on("reconnect",function(data){
            fireEvent("reconnect",data);
        });

        socket.on("reconnecting",function(data){
            fireEvent("reconnecting",data);
        });


        //登陆成功
        socket.on("guest login",function(data){
            fireEvent("guest login",data);
        });
        //宾客严惩登陆
        socket.on("guest lazy login",function(data){
            fireEvent("guest lazy login",data);
        });

        //切换场景完毕
        socket.on("scSwiched",function(data){
            fireEvent("scSwiched",data);
        });

        //大屏幕连接
        socket.on("lsLogined",function(data){
            fireEvent("lsLogined",data);
        })

        //大屏幕断开
        socket.on("guest disconnect",function(data){
            fireEvent("guest disconnect",data);
        });

        //宾客图拍
        socket.on("guest wishPic",function(data){
            fireEvent("guest wishPic",data);
        });

        //宾客摇一摇
        socket.on("guest happyShake",function(data){
            fireEvent("guest happyShake",data);
        });

        //宾客祝福
        socket.on("guest wishText",function(data){
            fireEvent("guest wishText",data);
        });

        //宾客签到
        socket.on("guest sign",function(data){
            fireEvent("guest sign",data);
        });
    }
}