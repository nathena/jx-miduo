angular.module("loginApp", ["ngAnimate"]);

function initController() { // 初始化
    var $scope     = angular.element("[ng-controller=loginController]").scope(),
        $tabsSlide = $(".tabs > font");
    
    /* [页面初始动画] Start */
    $(".logo").css({
        left    : 0,
        opacity : 1
    });
    $(".box").addClass("box-animate")[0].addEventListener("webkitAnimationEnd", function() {
        $scope.tabsDisabled = true;
    }, false);
    /* [页面初始动画] End */
    
    $tabsSlide[0].addEventListener("webkitTransitionEnd", function() { // 登录&注册界面切换动画判断
        setTimeout(function() { // 因登录&注册框的界面动画是由angular决定，且在动画执行完后会销毁元素，所以无法被捕捉到，只能通过捕捉选项滑块的动画来判断，而选项滑块动画结束后登录&注册框的动画还未完全执行完毕，所以要加一个300毫秒的延迟
            $scope.tabsDisabled = true;
            $tabsSlide.removeClass("delay300-ease-in"); // 在每次动画进行前加上过渡效果样式，在动画结束后去除过渡样式，以防浏览器窗口改变后滑块跑到新位置而出现动画效果
        }, 300);
    }, false);
    
    $(window).resize(function() {
        $scope.$apply(function() {
            $scope.tabsSlideOffset = $(".tabs > span:eq(" + $scope.tabsIndex + ")").position().left; // 防止窗口大小改变后选项栏的滑块会错位
        });
    });
};

function loginController($scope) {
    $scope.tabsIndex            = 0; // 注册登录当前选中项
    $scope.tabsSlideOffset      = 0; // 注册登录选中项滑块水平偏移量
    $scope.remenberPass         = true; // 是否记住密码
    $scope.coverVisible         = false; // 遮罩层是否可见
    $scope.createWeddingVisible = false; // 创建婚礼表单弹出层是否可见
    $scope.tabsDisabled         = false; // 注册登录选项栏是否可用（为防止在动画执行时被中断，导致切换动画不完美）
    $scope.autocomplete = { // 【邮箱自动完成】
        visible : false, // 是否可见
        width   : "0px", // 宽度
        top     : "0px", // Y偏移量
        left    : "0px" // X偏移量
    };
    $scope.btnCaption = { // 【按钮文本内容】
        login   : "登 录",
        reg     : "注 册",
        wedding : "创建婚礼"
    };
    $scope.formText = { // 【表单文本框内容】
        login : { // 登录表单
            account : "",
            pass    : ""
        },
        reg : { // 注册表单
            account : "",
            pass    : ""
        },
        wedding : { // 创建婚礼表单
            groom : "",
            bride : "",
            date  : ""
        }
    };
    
    $scope.tabsClick = function(_index, _obj) { // 【注册登录选项栏点击事件】
        if($scope.tabsIndex == _index || !$scope.tabsDisabled) { return; } // 如果页面初始动画未执行完成，则无法操作，以免因动画混乱影响体验
        $(".tabs > font").addClass("delay300-ease-in"); // 在每次动画进行前加上过渡效果样式，在动画结束后去除过渡样式，以防浏览器窗口改变后滑块跑到新位置而出现动画效果
        $scope.tabsIndex = _index;
        $scope.tabsSlideOffset = $(_obj).position().left;
        $scope.tabsDisabled = false;
    };
    
    $scope.inputFocus = function(_obj) { // 【文本框获得焦点事件】
        juxiDBY.ui.errorBorder.clear(_obj);
        if($(".login-reg .left > input:eq(0)")[0] == _obj) {
            new EmailAutoComplete({});
        };
    };
    $scope.loginSubmit = function() { // 【登录点击事件】
        if(!$scope.tabsDisabled) { return; } // 如果页面初始动画未执行完成，则无法操作，以免因动画混乱影响体验
        var accountCheck = $scope.formCheck.login.account(),
            passCheck    = $scope.formCheck.login.pass();
        
        if(accountCheck !== "[ok]") {
            juxiDBY.ui.errorBorder.clear(".login-box .left :text");
            juxiDBY.ui.errorBorder.add(".login-box .left :text", accountCheck);
            return;
        } else if (passCheck !== "[ok]") {
            juxiDBY.ui.errorBorder.clear(".login-box .left :password");
            juxiDBY.ui.errorBorder.add(".login-box .left :password", passCheck);
            return;
        };
        var loginSucc = juxiDBY.net.postJSON("login", {
                email    : $scope.formText.login.account,
                password : $scope.formText.login.pass
            });
        console.log(loginSucc);
        if(loginSucc.code == 0) { // 登录成功
            alert("登录成功！");
        };
    };
    $scope.regSubmit = function() { // 【注册点击事件】
        var accountCheck = $scope.formCheck.reg.account(),
            passCheck    = $scope.formCheck.reg.pass();
        
        if(accountCheck !== "[ok]") {
            juxiDBY.ui.errorBorder.clear(".reg-box .left :text");
            juxiDBY.ui.errorBorder.add(".reg-box .left :text", accountCheck);
            return;
        } else if (passCheck !== "[ok]") {
            juxiDBY.ui.errorBorder.clear(".reg-box .left :password");
            juxiDBY.ui.errorBorder.add(".reg-box .left :password", passCheck);
            return;
        };
        $scope.coverVisible = true;
        $scope.createWeddingVisible = true;
        setTimeout(function() { // 因angular将弹出层加载出来会在该事件结束之后进行，所以需要setTimeout一下让该事件结束才能加载日历选择器，否则.calendar-textbox这个元素是不存在的
            $(".calendar-textbox").keydown(function() { // 婚礼日期文本框禁止用户输入
                return false;
            }).datetimepicker({ // 日历选择器
                timepicker : false,
                format     : "Y-m-d"
            });
        }, 1);
    };
    $scope.weddingSubmit = function() { // 【创建婚礼提交事件】
        var groomCheck = $scope.formCheck.wedding.name("groom"),
            brideCheck = $scope.formCheck.wedding.name("bride"),
            dateCheck  = $scope.formCheck.wedding.date();
        
        if(groomCheck !== "[ok]") {
            juxiDBY.ui.errorBorder.clear(".createWedding > input:eq(0)");
            juxiDBY.ui.errorBorder.add(".createWedding > input:eq(0)", groomCheck);
            return;
        } else if (brideCheck !== "[ok]") {
            juxiDBY.ui.errorBorder.clear(".createWedding > input:eq(1)");
            juxiDBY.ui.errorBorder.add(".createWedding > input:eq(1)", brideCheck);
            return;
        } else if (dateCheck !== "[ok]") {
            juxiDBY.ui.errorBorder.clear(".createWedding > input:eq(2)");
            juxiDBY.ui.errorBorder.add(".createWedding > input:eq(2)", dateCheck);
            return;
        };
        var regSucc = juxiDBY.net.postJSON("register", {
                email    : $scope.formText.reg.account,
                password : $scope.formText.reg.pass,
                openPlat : "ymhj"
            });
        if(regSucc.code == 0) { // 注册成功
            alert("注册成功！");
            $scope.coverVisible = false;
            $scope.createWeddingVisible = false;
        };
    };
    $scope.coverClick = function() { // 【遮罩层点击事件】
        if(!$scope.coverVisible) { return; } // 以防未知错误
        $scope.coverVisible = false;
        if($scope.createWeddingVisible) { $scope.createWeddingVisible = false; } // 如果创建婚礼弹出层在显示中则一并隐藏
    };
    
    $scope.formCheck = { // 表单数据验证
        login : { // 登录表单
            account : function() {
                if(!$scope.formText.login.account) {
                    return "请输入您注册的邮箱账号";
                } else if(!$scope.formText.login.account.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)) {
                    return "请输入正确的邮箱账号";
                } else {
                    var checkSucc = juxiDBY.net.postJSON("checkEmail", {
                        email : $scope.formText.login.account
                    });
                    if(checkSucc.code != 0) {
                        return checkSucc.msg;
                    };
                };
                return "[ok]";
            },
            pass : function() {
                if(!$scope.formText.login.pass || !$scope.formText.login.pass.match(/[a-zA-Z0-9]{6,32}/)) {
                    return "请正确输入密码";
                };
                return "[ok]";
            }
        },
        reg : { // 注册表单
            account : function() {
                if(!$scope.formText.reg.account) {
                    return "请输入您需要注册的邮箱号";
                } else if(!$scope.formText.reg.account.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)) {
                    return "请输入正确的邮箱号";
                } else {
                    var checkSucc = juxiDBY.net.postJSON("checkEmail", {
                        email : $scope.formText.reg.account
                    });
                    if(checkSucc.code != 0) {
                        return checkSucc.msg;
                    };
                };
                return "[ok]";
            },
            pass : function() {
                if(!$scope.formText.reg.pass) {
                    return "请输入需要设置的密码";
                } else if(!$scope.formText.reg.pass.match(/[a-zA-Z0-9]{6,32}/)) {
                    return "请输入6-32位字母或数字的密码";
                };
                return "[ok]";
            }
        },
        wedding : { // 创建婚礼表单
            name : function(_type) {
                var typeName = { // 相应称谓
                    groom : "新郎",
                    bride : "新娘"
                };
                
                if(!$scope.formText.wedding[_type]) {
                    return "请输入" + typeName[_type] + "的名字";
                } else if($scope.formText.wedding[_type].match(/[^a-zA-Z\u4e00-\u9fa5]/g)) {
                    return typeName[_type] + "名字必须为汉字或英文字母";
                };
                return "[ok]";
            },
            date : function() {
                var nowDate     = new Date(),
                    weddingDate = new Date($scope.formText.wedding.date);
                
                if(!$scope.formText.wedding.date) {
                    return "请选择婚礼时间";
                } else if (weddingDate - nowDate < 0) {
                    return "请选择正确的婚礼时间";
                };
                return "[ok]";
            }
        }
    };
};