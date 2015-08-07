/**
 * Created by xyliu on 15/1/24.
 */


require('../lib/base.js');
var modelUserScene=new require('../models/userScene.js');

var testUid = '2b403b4eb49d02792941d8d48218ae82';

this.TestForModelUserScene = {

    //'Test4getUserSceneList': function (test) {
    //    modelUserScene.getUserSceneList(testUid,function(err,lstUserScene){
    //        lstUserScene.forEach(function(userScene){
    //            logger.debug('userScene: '+JSON.stringify(userScene));
    //        });
    //
    //        test.ok(!!lstUserScene, 'lstUserScene should not be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //},
    //'Test4getWeddingSceneInfo': function (test) {
    //
    //    modelUserScene.getWeddingSceneInfo(testUid,function(err,weddingScene){
    //        logger.debug('weddingScene: '+JSON.stringify(weddingScene));
    //
    //
    //        test.ok(!!weddingScene, 'weddingScene should not be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //},
    //'Test4saveUserSceneSetting': function (test) {
    //
    //    modelUserScene.saveUserSceneSetting(testUid,function(err,weddingScene){
    //        logger.debug('weddingScene: '+JSON.stringify(weddingScene));
    //
    //
    //        test.ok(!!weddingScene, 'weddingScene should not be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //},
    //'Test4saveUserSceneSetting': function (test) {
    //    var sceneIds = ['s169','s233','s129'];
    //    modelUserScene.saveUserSceneSetting('test111',sceneIds,function(err){
    //
    //        test.ok(!err, 'err should be null.');
    //        test.done();
    //    });
    //
    //    test.done();
    //},
    'Test4switchWeddingScene': function (test) {
        var wsSwitchInfo = {
            'userId':'test111'
        };
        modelUserScene.switchWeddingScene(wsSwitchInfo,function(err){

            test.ok(!err, 'err should be null.');
            test.done();
        });

        test.done();
    }
};