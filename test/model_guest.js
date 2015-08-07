/**
 * Created by xyliu on 15/1/26.
 */

require('../lib/base.js');
var libUtils=new require('../lib/utils.js');
var modelGuest=new require('../models/guest.js');


this.TestForModelGuest = {
    //'Test4addGuest': function (test) {
    //    var guestInfo = {
    //        'id': libUtils.utils.getGuid(),
    //        'userId':'test111',
    //        'openId': 'guest133434324',
    //        'openPlatType': 'weixin'
    //    };
    //
    //    modelGuest.add(guestInfo,function(err){
    //        test.ok(!err, 'err should be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //},
    'Test4saveGuestSignInfo': function (test) {

        modelGuest.saveGuestSignInfo('test111','guest0000003',function(err){
            test.ok(!err, 'err should be null.');
            test.done();
        });

        test.done();
    }
};