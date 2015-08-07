/**
 * Created by xyliu on 15/1/19.
 */


var utils=new require('../lib/utils.js');
this.TestForUtils = {
    'TestgetGuid': function (test) {
        var guid=utils.utils.getGuid();
        test.ok(!!guid, 'getGuid should not be null.');
        test.done();
    },
    'TestStartWithWords': function (test) {
        var name="ad_123";
        test.ok(utils.utils.startWith(name, "ad_"),"startwith method should be ok");
        test.done();
    }
};