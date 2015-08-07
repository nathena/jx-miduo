angular.element(document).ready(function() {
    juxiDBY.functions.pageErrCheck();
    $(window).resize(function() {
        juxiDBY.functions.pageErrCheck();
    });
    if(typeof initController == "function") { initController(); }
});

var juxiDBY = {
    /** [网络类] */
    net : {
        /**
          * @progam post获取数据且已json格式返回
          * @method juxiDBY.net.postJSON(data)
          * @return 无
          * @parameter //传递的数据需是JSON数组
          *     data       (jsonArrayObject)   需要传输的数据，json数组对象格式
          * @example
          *     juxiDBY.net.postJSON({service:"detailWd",pId:"8a22d2d34a149579014a1987e0c6001d"});
          * @author 猕猴桃
          * @date 2014.12.24
          * @brief
                若有需要，可改为Angular的http get取数据。
                本方法取自移动端
          * @history
          *     2014/12/24 By:猕猴桃  用于本项目所有页面post取数据。
          */
        postJSON : function(_url, _data) {
            var jsonObj = null;
            $.ajax({
                url      : _url,
                type     : "POST",
                dataType : "json",
                async    : false,
                data     : $.extend({client:"h5", siteCode:"3502"}, _data),
                success  : function(jsonData) {
                    jsonObj = jsonData;
                }
            });
            return jsonObj;
        }
    },
    /** [功能类] */
    functions : {
        /**
          * @progam 页面错误检测函数
          * @method juxiDBY.functions.pageErrCheck()
          * @return
                (Boolean)|"[ok]"|      页面无错误，为防止返回true会在String文本型逻辑判断中被判定为true，所以返回一个特定的文本表示无错误
                (Number)               错误ID 【在返回前会跳转页面，可能拿不到返回值。。。】
          * @example
          *     juxiDBY.functions.pageErrCheck();
          * @author 猕猴桃
          * @date 2015.01.22
          * @history
          *     2015/01/22 By:猕猴桃 仅有判断设备分辨率宽度是否过低功能
          */
        pageErrCheck : function() {
            var pageURL        = window.location.href, // 页面URL地址
                fileNameStop   = pageURL.lastIndexOf("?"), // 提取页面文件名的结尾处
                fileNameLength = fileNameStop == -1 ? pageURL.length : fileNameStop, // 提取页面文件名需要的长度
                fileName       = pageURL.substring(pageURL.lastIndexOf("/") + 1, fileNameLength),  // 页面文件名
                browserSys     = {}, // 浏览器版本，browserSys.ie \ browserSys.firefox \ browserSys.chrome \ browserSys.opera \ browserSys.safari
                browserUA      = navigator.userAgent.toLowerCase(), // 浏览器UA
                browserVersion = false; // 浏览器内核检测
            
            if(fileName == "error.html") { return; } // 如果是错误提示页面则不进行检测了
            
            /* 浏览器内核及版本检测 Start */
            (browserVersion = browserUA.match(/msie ([\d.]+)/)) ? browserSys.ie = browserVersion[1] :
            (browserVersion = browserUA.match(/firefox\/([\d.]+)/)) ? browserSys.firefox = browserVersion[1] :
            (browserVersion = browserUA.match(/chrome\/([\d.]+)/)) ? browserSys.chrome = browserVersion[1] :
            (browserVersion = browserUA.match(/opera.([\d.]+)/)) ? browserSys.opera = browserVersion[1] :
            (browserVersion = browserUA.match(/version\/([\d.]+).*safari/)) ? browserSys.safari = browserVersion[1] : 0;
            /* 浏览器内核及版本检测 End */
            
            if($(window).width() < 960) { // 检测分辨率能否正常显示页面
                location.href = "error.html?errId=0";
                return 0;
            } else if (parseFloat(browserSys.ie) < 10) { // 检测IE浏览器内核是否低于10
                location.href = "error.html?errId=1";
                return 1;
            };
            return "[ok]";
        },
        /**
          * @progam 获取 QueryString
          * @method juxiDBY.functions.getQueryString(strName)
          * @return (String) 取到的QueryString值
          * @parameter
          *     strName  (String)需要获取的QueryString名
          * @example
          *     juxiDBY.functions.getQueryString("page");
          * @author 猕猴桃
          * @date 2014.11.28
          * @brief
          *     该代码截取于移动端
          * @history
          *     2014/11/28 By:猕猴桃  用于获取QueryString
          */
        getQueryString : function (strName) {
            var args  = {},
                query = location.search.substring(1), // 获取QueryString
                pairs = query.split("&"); // 分割&符号
            
            for (var i=0; i<pairs.length; i++) {
                var pos = pairs[i].indexOf('='); // 寻找"name=value"
                if (pos == -1) continue; // 如果没找到则跳过
                var argname = pairs[i].substring(0, pos), // 提取到的name
                    value   = pairs[i].substring(pos + 1); // 提取到的value
                value = decodeURIComponent(value); // 解码
                args[argname] = value; // 全部存储为数组
            }
            return args[strName]; // 返回需要的QueryString
        }
    },
    /** [界面类] */
    ui : {
        /** 错误-边框提示 */
        errorBorder : {
            /**
              * @progam 添加边框型错误提示
              * @method juxiDBY.ui.errorBorder.add(obj, value)
              * @return 无
              * @parameter
              *     obj        (Object)需要添加边框型错误提示的元素对象
              *     value      (String)提示的信息内容能够
              * @example
              *     juxiDBY.ui.errorBorder.add("#test-text", "密码错误");
              * @author 猕猴桃
              * @date 2014.11.12
              * @brief
              *     该代码截取于移动端
              * @history
              *     2014/11/12 By:猕猴桃  用于登录页文本框添加边框型错误提示。
              */
            add : function(obj, value) {
                var $obj = $(obj);
                if($obj.parent().css("position") != "absolute" || $obj.parent().css("position") != "relative") {
                    $obj.parent().css("position","relative");
                }
                var placeholderText = $obj.attr("placeholder"),
                    valueText       = $obj.val();
                
                $obj.attr("placeholder","").css("color","##FF4B5A").css("border","1px solid #FF4B5A");
                $obj.siblings("i").css("color","#FF4B5A").css("border","1px solid #FF4B5A").css("border-right","0");
                $("<div class='error-border' style='position:absolute;width:" + $obj.width() + "px;height:" + $obj.height() + "px;line-height:" + $obj.height() + "px;margin:auto;top:" + $obj.position().top + "px;left:" + ($obj.position().left + parseInt($obj.css("padding-left"))) + "px;color:#FF4B5A;font-size:" + $obj.css("font-size") + ";pointer-events:none;cursor:text;white-space:nowrap;' onclick='$(this).siblings(&#39;input&#39;).focus()'>" + value + "</div>").data("obj",$obj[0]).appendTo($obj.parent()).data("placeholderText",placeholderText).attr("data-value",valueText);
                $obj.val("");
            },
            /**
              * @progam 清除边框型错误提示
              * @method juxiDBY.ui.errorBorder.clear(obj)
              * @return 无
              * @parameter
              *     obj        (Object)需要清除边框型错误提示的元素对象
              * @example
              *     juxiDBY.ui.errorBorder.clear("#test-text");
              * @author 猕猴桃
              * @date 2014.11.12
              * @brief
              *     该代码截取于移动端
              *     如果该元素对象没有添加边框型错误提示不要调用这个方法！
              * @history
              *     2014/11/12 By:猕猴桃  用于隐藏登录页文本框添加边框型错误提示。
              */
            clear : function(obj) {
                var $obj            = $(obj),
                    $errorBorderObj = $obj.siblings(".error-border"),
                    valueText       = $errorBorderObj.attr("data-value");
                
                if($errorBorderObj.data("obj") != $obj[0]) { return; }
                $obj.attr("placeholder",$errorBorderObj.data("placeholderText")).css("border-color","#DDD").siblings(".error-border").remove();
                if(valueText || valueText == 0) {
                    $obj.val($errorBorderObj.attr("data-value"));
                }
            }
        },
        /* 文本框-浮动提示 */
        floatTips : {
            /**
              * @progam 添加文本框浮动提示
              * @method juxiDBY.ui.floatTips.add({jsonData})
              * @return 无
              * @parameter //传递的数据需是JSON对象
              *     obj        (Object)需要添加提示的元素对象
              *     text       (String)提示的文本内容
              *     icon       (String)[可空] |"icon-dbyright"| 图标的Class类名
              *     iconColor  (String)[可空] |"#63C76A"|       图标的背景色(前景色均为白色#FFF)
              *     iconSize   (String)[可空] |"12px"|          图标的大小
              *     color      (String)[可空] |"#666"|          提示文本的颜色
              *     fontSize   (String)[可空] |"14px"|          提示文本的字体大小
              * @example
              *     juxiDBY.ui.floatTips.add({obj: ".mail > input", text: "邮箱可注册"});
              *     juxiDBY.ui.floatTips.add({obj: ".user > input", text: "用户名格式不正确", icon: "icon-dbyerror", iconColor: "red", color: "red"});
              * @author 猕猴桃
              * @date 2015.01.26
              * @brief
              *     目前仅支持提示浮动在元素的右侧，如果需要可自行添加浮动其它位置，参数名建议:position，取值建议:top、left、right、bottom
              * @history
              *     2015/01/26 By:猕猴桃
              */
            add : function(jsonData) {
                if(!jsonData.obj) {
                    throw new Error("没有正确传入需要提示的标签");
                    return;
                } else if(!jsonData.text) {
                    throw new Error("没有正确传入需要提示的文本内容");
                    return;
                };
                var option = {
                    obj       : jsonData.obj       || "error",
                    text      : jsonData.text      || "error",
                    icon      : jsonData.icon      || "icon-dbyright",
                    iconColor : jsonData.iconColor || "#63C76A",
                    iconSize  : jsonData.iconSize  || "12px",
                    color     : jsonData.color     || "#666",
                    fontSize  : jsonData.fontSize  || "14px",
                };
                var $obj       = $(option.obj),
                    $objParent = $obj.parent(),
                    _position  = $objParent.css("position");
                
                if(_position != "relative" || _position != "absolute" || _position != "fixed") {
                    $objParent.css("position", "relative");
                };
                $("<p class='errorFloat' onselectstart='return false'><i class='" + option.icon + "' style='font-size:" + option.iconSize + ";background-color:" + option.iconColor + ";color:#FFF;margin-right:8px;width:20px;height:20px;border-radius:20px;line-height:20px;vertical-align:text-top;'></i>" + option.text + "</p>").css({
                    position   : "absolute",
                    minWidth   : option.iconSize,
                    height     : $obj.height(),
                    lineHeight : $obj.height() + "px",
                    top        : $obj.position().top + "px",
                    left       : $obj.position().left + $obj.outerWidth() + 10 + "px",
                    color      : option.color,
                    fontSize   : option.fontSize,
                    cursor     : "default"
                }).data("obj", $obj).appendTo($objParent);
            },
            /**
              * @progam 清除文本框浮动提示
              * @method juxiDBY.ui.floatTips.remove(obj)
              * @return 无
              * @parameter
              *     obj        (Object)需要清除提示的元素对象
              * @example
              *     juxiDBY.ui.floatTips.remove(".mail > input");
              * @author 猕猴桃
              * @date 2015.01.26
              * @brief
              *     如果没有添加过浮动提示请不要调用此方法，传入的对象请与添加提示的是同一元素，可以传入选择器字符文本、jQuery对象、js对象
              *     如果添加浮动提示的元素要被从DOM中移除，请在移除前先调用此方法将浮动提示清除，以免元素在DOM中被移除后无法清除对应的浮动提示(移除后重新加载或克隆复制一个"相同"的元素也是没用的，因为对象已经不同了)
              * @history
              *     2015/01/26 By:猕猴桃
              */
            remove : function(_obj) {
                var $obj         = $(_obj),
                    $errFloatObj = $(".errorFloat");
                
                if($errFloatObj.length < 1) {
                    throw new Error("没有存在的floatTips提示标签");
                    return;
                };
                $errFloatObj.each(function() {
                    if($obj[0] == $(this).data("obj")[0]) {
                        $(this).remove();
                        return;
                    }
                });
                throw new Error("未找到对象所属的floatTips提示标签");
            }
        },
        slideCheckbox : function(jsonData) {
            if(!jsonData.obj) {
                throw new Error("没有正确传入需要转成复选框的标签");
                return;
            };
            var option = {
                obj            : jsonData.obj            || "error",
                trueBackColor  : jsonData.trueBackColor  || "#FF7B8A",
                falseBackColor : jsonData.falseBackColor || "#B2B2B2",
                foreColor      : jsonData.trueForeColor  || "#FFF"
            };
            
            var $obj       = $(option.obj),
                _width     = $obj.width(),
                _height    = $obj.height(),
                _position  = $obj.css("position"),
                _offset    = (_height - (_height * .9)) / 2;
            
            if(_position != "relative" || _position != "absolute" || _position != "fixed") {
                $obj.css("position", "relative");
            };
            
            $obj.css({
                borderRadius    : _height * .9 + "px",
                backgroundColor : option.trueBackColor
            });
            
            $("<span></span>").css({
                display         : "block",
                position        : "absolute",
                margin          : "auto",
                top             : 0,
                bottom          : 0,
                right           : _offset + "px",
                width           : _height * .9,
                height          : _height * .9,
                backgroundColor : option.foreColor
            }).appendTo($obj);
        }
    }
};