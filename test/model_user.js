/**
 * Created by xyliu on 15/1/23.
 */

require('../lib/base.js');
var modelUser=new require('../models/user.js');
this.TestForModelUser = {
    //'Test4getUserInfoByEmail': function (test) {
    //    var guid=modelUser.getUserInfoByEmail('test@jytnn.com',function(err,userInfo){
    //        console.debug('userinfo: '+userInfo);
    //        test.ok(!!userInfo, 'getUserInfoByEmail should not be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //} ,
    //'Test4getUserInfoByEmail': function (test) {
    //    var guid=modelUser.getUserInfoByEmail('test@jytnn.com',function(err,userInfo){
    //        console.debug('userinfo: '+userInfo);
    //        test.ok(!!userInfo, 'getUserInfoByEmail should not be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //},
    //'Test4getUserInfoByEmail': function (test) {
    //    var weddingInfo = {
    //        'uid':'test111',
    //        'groomName':'悉尼狼',
    //        'brideName':'女神噢'
    //    };
    //    modelUser.modifyWeddingInfo(weddingInfo,function(err){
    //        test.ok(!!err, 'getUserInfoByEmail should not be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //},
    'Test4createOneWedding': function (test) {
        var weddingInfo = {
            'userId':'test111',
            'groomName':'悉尼狼',
            'brideName':'女神噢',
            'wedDate': new Date('2015-02-14')
        };
        modelUser.createOneWedding(weddingInfo,function(err){
            test.ok(!err, 'err should be null.');
            test.done();
        });

        test.done();
    }
};