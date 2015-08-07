/**
 * Created by nathena on 15/1/26.
 */

var Guest = {
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
            socket.emit("login",fireEvent("connect",data));
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
        socket.on("logined",function(data){
            fireEvent("logined",data);
        });

        //发布祝福成功
        socket.on("wishTexted",function(data){
            fireEvent("wishTexted",data);
        });

        //签到
        socket.on("signed",function(data){
            fireEvent("signed",data);
        });

        //照片上传完毕
        socket.on("wishPiced",function(data){
            fireEvent("wishPiced",data);
        });

        //切换场景
        socket.on("scSwiched",function(data){
            fireEvent("scSwiched",data);
        });

        //大屏幕连接
        socket.on("lsLogined",function(data){
            socket.emit("guest lazy login");
            fireEvent("lsLogined",data);
        })

        //大屏幕断开
        socket.on("ls disconnect",function(data){
            fireEvent("ls disconnect",data);
        });
    }
    /**
     * sign
     * @param event
     * @param data
     */
    ,sign:function(data){
        this.socket.emit("sign",data);
    }
    /**
     * 祝福语
     * @param data
     */
    ,wishText:function(data){
        this.socket.emit("wishText",data);
    }
    /**
     * 摇一摇
     * @param data
     */
    ,happyShake:function(data){
        this.socket.emit("happyShake",data);
    }
    /**
     * 拍照片
     * @param data
     */
    ,wishPic:function(data){
        this.socket.emit("wishPic",data);
    }
}