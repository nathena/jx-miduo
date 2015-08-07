function homeController($scope) {
    $scope.listCheck = [true, false, true];
    $scope.toolList = [
        {
            icon      : "icon-iconshake",
            iconColor : "#47D1DE",
            title     : "幸福摇",
            msg       : "艾美是一个起源于法国的酒店品牌，任命法国艺术大师杰罗姆·桑斯为全职文化策展人，转换一系列宾客体验，为宾客打造独特的互动空间。",
            value     : true
        },
        {
            icon      : "icon-iconblessing",
            iconColor : "#FF7B8A",
            title     : "最好的祝福",
            msg       : "艾美是一个起源于法国的酒店品牌，任命法国艺术大师杰罗姆·桑斯为全职文化策展人，转换一系列宾客体验，为宾客打造独特的互动空间。",
            value     : false
        },
        {
            icon      : "icon-iconphotograph",
            iconColor : "#FF9E5C",
            title     : "祝福拍",
            msg       : "艾美是一个起源于法国的酒店品牌，任命法国艺术大师杰罗姆·桑斯为全职文化策展人，转换一系列宾客体验，为宾客打造独特的互动空间。",
            value     : true
        }
    ];
    
    $scope.listCheckClick = function(_index) {
        $scope.listCheck[_index] = !$scope.listCheck[_index];
    }
};