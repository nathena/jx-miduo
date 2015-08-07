/**
 * Created by nathena on 15/7/10.
 */

var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var util = require("util");
var urlencode = require('urlencode');

var HttpUtil = require("./HttpUtil");

/**

 01	批量短信提交成功
 02	IP限制
 03	单条短信提交成功
 04	用户名错误
 05	密码错误
 07	发送时间错误
 08	信息内容为黑内容
 09	该用户的该内容 受同天内，内容不能重复发 限制
 10	扩展号错误
 97	短信参数有误
 11	余额不足
 -1	程序异常

 */

var GuoDuMsg = {};
GuoDuMsg["01"] = "批量短信提交成功";
GuoDuMsg["02"] = "IP限制";
GuoDuMsg["03"] = "单条短信提交成功";
GuoDuMsg["04"] = "用户名错误";
GuoDuMsg["05"] = "密码错误";
GuoDuMsg["07"] = "发送时间错误";
GuoDuMsg["08"] = "信息内容为黑内容";
GuoDuMsg["09"] = "该用户的该内容 受同天内，内容不能重复发 限制";
GuoDuMsg["10"] = "扩展号错误";
GuoDuMsg["97"] = "短信参数有误";
GuoDuMsg["11"] = "余额不足";
GuoDuMsg["-1"] = "程序异常";

var username = "";
var password = "";
var appendId = "";
var charset = "GBK";

var api = "http://221.179.180.158:9007/QxtSms/QxtFirewall?OperID=%s&OperPass=%s&SendTime=%s&ValidTime=%s&AppendID=%s&DesMobile=%s&Content=%s&ContentType=%s";


function toSend(mobiles,content,contentType,callback){

      var sendApi =  util.format(api
                                 ,urlencode(username,charset)
                                 ,urlencode(password,charset)
                                 ,"","",urlencode(appendId,charset),urlencode(mobiles,charset),urlencode(content,charset),contentType);

    HttpUtil.httpGet(sendApi,function(err,xmlContent){

          if( err ){
             return callback(err);
          }

          var doc = new dom().parseFromString(xmlContent);

          var code = "",desMobile = "" ,msgid = "";

          var nodes = xpath.select("//response/code", doc);
          if( nodes[0] && nodes[0].firstChild ){
              code = nodes[0].firstChild.data
          }

          nodes = xpath.select("//response/message/desmobile", doc);
          if( nodes[0] && nodes[0].firstChild ){
              desMobile = nodes[0].firstChild.data
          }

          nodes = xpath.select("//response/message/msgid", doc);
          if( nodes[0] && nodes[0].firstChild ){
              msgid = nodes[0].firstChild.data
          }


          callback(err,{code:code,codeMsg:GuoDuMsg[code],desMobile:desMobile,msgid:msgid});
      });
}


exports.send = function(mobile,content,callback){

    toSend(mobile,content,15,callback);
}


exports.sendLongMsg = function(mobile,content,callback){

    toSend(mobile,content,8,callback);
}

