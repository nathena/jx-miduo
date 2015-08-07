/**
 * Created by nathena on 15/1/26.
 */

var Sc = {
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
        socket.on("scLogined",function(data){
            fireEvent("scLogined",data);
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
        socket.on("ls disconnect",function(data){
            fireEvent("ls disconnect",data);
        });
    }
    /**
     * 切换场景
     * @param data
     */
    ,scSwich:function(data){
        this.socket.emit("scSwich",data);
    }

}