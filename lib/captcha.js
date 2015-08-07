/**
 * 验证码
 * Created by nathena on 15/1/23.
 */

var ccap = require('ccap');

var charPool = ('abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase() + '1234567890');
var len = charPool.length;

var captcha = ccap({

    width:100,//set width,default is 256

    height:35,//set height,default is 60

    offset:20,//set text spacing,default is 40

    quality:100,//set pic quality,default is 50

    fontsize:30,

    generate:function(){//Custom the function to generate captcha text

        //generate captcha text here
        //return the captcha text
        return (function(){

            return ""+random()+random()+random()+random();

            function random(){

                var index = Math.ceil(len*Math.random(len));
                return charPool[index];
            }
        })();

    }

});

module.exports = captcha;