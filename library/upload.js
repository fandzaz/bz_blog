var multer  = require('multer')
module.exports = new function(){
  var storage = multer.diskStorage({
      destination: function (req, file, cb) {
          //var path = "../uploadchat/";
          var path = "./uploads/";
          cb(null, path)
      },
      filename: function (req, file, cb) {
        cb(null, req.body.user_id + '-' + Date.now()+'-'+Math.floor(Math.random() * 1000000000)+'-'+file.originalname);
    }
  })
  var storageGroup = multer.diskStorage({
      destination: function (req, file, cb) {
          //var path = "../uploadchat/";
          var path = "./uploads/";
          cb(null, path)
      },
      filename: function (req, file, cb) {
        cb(null, req.body.gid + '-' + Date.now()+'-'+Math.floor(Math.random() * 1000000000)+'-'+file.originalname);
    }
  })
  this.upload = function(){
    return multer({storage:storage,limits: { files:12,fileSize:5000000 }}).any();
  }
  this.uploadGroup = function(){
    return multer({storage:storageGroup,limits: { fileSize:1000000 }}).single('file');
  }

}
