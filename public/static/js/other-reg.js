function otherRegController($scope) {
    $scope.followedWeibo = true; // 是否关注多宝娱官方微博
    
    $scope.regSubmit = function() { // 【注册提交事件】
        juxiDBY.ui.floatTips.add({
            obj : ".form-box > input:eq(0)",
            text : "测试一下"
        });
    };
};