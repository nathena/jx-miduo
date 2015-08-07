/**
 * Created by xyliu on 15/1/23.
 */

var http = require('http'),
    querystring = require('querystring');

// 这就是post发送的数据
var contents = querystring.stringify({
    email: "xiyou@jytnn.com",
    password: "123456"
});

// 通过querystring.stringify处理过的数据基本就是这个格式: uid=XXXX&pwd=XXXX 很熟悉对吧...

// 创建http请求的配置参数, 下面的请求地址都是自己YY的, 基本都是这个格式
var options = {
    host: 'http://127.0.0.1:3000', // 这个不用说了, 请求地址
    path: '/register', // 具体路径, 必须以'/'开头, 是相对于host而言的
    method: 'post', // 请求方式, 这里以post为例
    headers: { // 必选信息, 如果不知道哪些信息是必须的, 建议用抓包工具看一下, 都写上也无妨...

        "Content-Type":"application/x-www-form-urlencoded; charset=utf8", // 可以设置一下编码
        "Content-Length":contents.length, // 请求长度, 通过上面计算得到
        "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

        // 这些都是用抓包程序看到的..就都写上了, 若想少写, 可以一个一个删除试试
        "Accept-Encoding": "gzip,deflate,sdch",
        "Accept-Language":"zh-CN, zh;q=0.8",
        "Cache-Control":"max-age=0",
        "Connection":"Keep-Alive",
        "Host":"127.0.0.1",
        "Origin":"127.0.0.1",
        "Referer":"http://127.0.0.1:3000/register",
        "User-Agent":"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.92 Safari/537.1 LBBROWSER"

        // 最后 有些网站的某些功能是需要附带cookie信息的. 因此在这里还需加一行
        // "Cookie":"some cookie message"
    }
};

// 接下来就是创建http请求
var req=http.request(options,function(res){
    res.setEncoding("utf8"); // 设置编码

    var result = "",
        resData = "",
        headers = res.headers, // 像上面所说的, 获取响应的头信息
        cookies = headers["set-cookie"]; // 获得服务器返回的cookie信息, 以后某些功能或许会需要将这些信息一起发送, 因此最好保存下来

    cookies.forEach(function(cookie) {
        result += cookie.replace(/path=\//g,'');
    });

    // 比如把cookie写入文件等, 具体怎么写我就不讲啦...

    // 数据很多的情况下, 并非一次发送完毕. 因此需要记录下整个过程中发送的数据
    res.on("data",function(data){
        resData += data;
    });

    // 在数据发送完毕后触发
    res.on("end", function() {
        // querystring.parse功能: 就是解析...比如一个object会把它解析成object
        console.log(querystring.parse(resData));
    });
});


req.write(contents); // xhr.send(). 感觉跟这个差不多
req.end(); // 这个必须有, 不然就一直等待结束