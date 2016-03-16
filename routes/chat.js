var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat');
});
router.post('/chatlist', function(req, res, next) {
	console.log(req.body.id);
	var session_id = req.body.id;

  var group = [];
  var user = [];
	var list_chat = [];
  var friend = [];




//
	db.find('Bzn_group',{member:db.ObjectId(session_id)},function(data){
      data.forEach(function(item){
        user.push(item.member[0]);
        user.push(item.member[1]);
        group.push(item._id);
      });
      db.find('Bzn_users',{ _id: { $in: user } },function(data_user){
          var i = 0;
          data_user.forEach(function(user){
            if(user._id != session_id){
              list_chat.push({groupid:group[i],_id:user._id,name:user.first_name});
              i++;
            }

          });

        res.json(list_chat);


      });

  });
		// data.forEach(function(item){
    //   db.find('Bzn_users',{_id:db.ObjectId(item.member[0])},function(user){
    //     insert = {groupid:item._id,user_id:user[0]._id,name:first_name.}
    //     list_chat.push(insert);
    //   })
    // })




});



module.exports = router;
