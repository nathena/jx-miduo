/**
 * Created by xyliu on 15/1/27.
 */


// 移动文件需要使用fs模块
var fs = require('fs');
var path = require('path');
//var multiparty = require('multiparty');

/**
 * 上传 宾客的祝福拍
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.uploadWishPic = function uploadWishPic(req, res, next) {

    //限制上传文件的大小
    if(req.files.photo.size > 1048576){   // 1024 * 1024   1Mb
        console.log('file size is too big. ');
        return next(new UploadFileSizeLimitError());
    }

    console.log('upload done: ' + req.files);

    var userId = req.body.userId || '';
    if(userId.length===0){
        console.log('file owner(userId) is missing. ');
        return next(new  InvalidParamError());
    }


    // 获得文件的临时路径
    var tmp_path = req.files.photo.path;

    // 指定文件上传后的目录 ，并 用时间戳重命名。
    var target_dir = '../upload/' + userId;
    var filename = new Date().getTime() + path.extname(tmp_path);
    var target_path = target_dir + '/' + filename;

    try{
        if (fs.existsSync(target_dir)) {
            console.log('已经创建过此更新目录了');
        } else {
            fs.mkdirSync(target_dir);
        }
    }catch(err) {
        logger.debug('uploader.upload: create direction error ==>'+err);
        return next(err);
    }

    // 移动文件
    fs.rename(tmp_path, target_path, function(err) {
        if (err) {
            logger.debug('uploader.upload: rename error ==>'+err);
            return next(err);
        }
        //res.json({code:0,msg:'File uploaded to: ' + target_path + ' - ' + req.files.photo.size + ' bytes'});
        res.json({code:0,msg:'File uploaded!',picPath:'/upload/'+userId+'/'+filename} );

        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function() {
            if (err){
                logger.debug('uploader.upload: 删除临时文件夹文件 error ==>'+err);
                return next(err);
            }

        });
    });

};


/**
 * 测试失败
 * @param req
 * @param res
 * @param next
 */
exports.uploadWithProgress = function uploadWithProgress(req, res, next) {

    ////限制上传文件的大小
    //if(req.files.image.size > 1048576){   // 1024 * 1024   1Mb
    //    return next(new UploadFileSizeLimitError());
    //}

    //bind event handler
    var form = new multiparty.Form();
    form.on('progress', function (bytesReceived, bytesExpected) {
        console.log(((bytesReceived / bytesExpected) * 100) + "% uploaded");
    });

    form.on('end',function(){
        console.log('upload done: ' + req.files);

        // 获得文件的临时路径
        var tmp_path = req.files.thumbnail.path;
        // 指定文件上传后的目录 。
        var target_path = '../uploadFiles/' + req.files.thumbnail.name;
        // 移动文件
        fs.rename(tmp_path, target_path, function(err) {
            if (err) {
                logger.debug('uploader.upload: rename error ==>'+err);
                return next(err);
            }
            res.json({code:0,msg:'File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes'});

            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function() {
                if (err){
                    logger.debug('uploader.upload: 删除临时文件夹文件 error ==>'+err);
                    return next(err);
                }

            });
        });

    });

    form.parse(req);

};

/**
 * 测试失败
 * @param req
 * @param res
 */
exports.uploadFile = function(req, res) {


    var form = new multiparty.Form();
    var size = '';
    var fileName = '';
    form.on('part', function (part) {
        if (!part.filename) return;
        size = part.byteCount;
        fileName = part.filename;
    });
    form.on('file', function (name, file) {
        console.log(file.path);
        console.log(__dirname);
        console.log('filename: ' + fileName);
        console.log('fileSize: ' + (size / 1024));
        var tmp_path = file.path
        var target_path = __dirname + '/uploads/fullsize/' + fileName;
        var thumbPath = __dirname + '/uploads/thumbs/';
        fs.renameSync(tmp_path, target_path, function (err) {
            if (err) console.error(err.stack);
        });
        res.redirect('/uploads/fullsize/' + fileName);
        console.log(target_path);
    });
    form.parse(req);
}


/**
 * 测试失败
 * @param req
 * @param res
 */
exports.uploadExample = function uploadExample(req,res){
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.writeHead(400, {'content-type': 'text/plain'});
            res.end("invalid request: " + err.message);
            return;
        }
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received fields:\n\n '+util.inspect(fields));
        res.write('\n\n');
        res.end('received files:\n\n '+util.inspect(files));
    });
}