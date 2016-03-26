var express = require('express');
var router = express.Router();
var Group = require('mongoose').model('group');
var Users = require('mongoose').model('users');
var Shop = require('mongoose').model('shop');
var Friend = require('mongoose').model('friend');
var Group_message = require('mongoose').model('group_message');
var User_online = require('mongoose').model('user_online');
var Group_member = require('mongoose').model('group_member');
var Entities = require('html-entities').AllHtmlEntities;
var ent = require('ent');
entities = new Entities();
var php = require('phpjs');
/* GET home page. */
router.get('/', function(req, res, next) {
 	res.render('chat2');
});
router.get('/master', function(req, res, next) {
	res.render('chat3');
});
router.post('/addActivities',function(req,res,next){
  var user_id = req.body.user_id;
  var session_id = req.body.id;
  group = new Group({
    group_name:null,
    group_type:'p',
    member:[db.ObjectId(session_id),db.ObjectId(user_id)],
    last_update:function_t.getTime(),
    shop_id:''
  });
  group.save(function(err){
    if(err){
      console.log(err);
    }else{
      group1 = Group_member({
        user_id:db.ObjectId(session_id),
        group_id:db.ObjectId(group._id),
        join_date:function_t.getTime(),
        last_update:function_t.getTime(),
      });
      group2 = Group_member({
        user_id:db.ObjectId(user_id),
        group_id:db.ObjectId(group._id),
        join_date:function_t.getTime(),
        last_update:function_t.getTime(),
      });
      group1.save();
      group2.save();
      res.json(group);
      console.log(group);
    }
  })
});
router.post('/sendChatMessage',function(req,res,next){
    var gid = req.body.gid;
    var message = req.body.message;
    var user_id = req.body.user_id;
  // for(var i = 0;i < 2 ;i++){
    var addGroup = new Group_message({
      group_id:db.ObjectId(gid),
      user_id:db.ObjectId(user_id),
      content:message,
      post_time:function_t.getTime(),
      read_status:0,
      post_type:'text',
      ip:'119.76.67.25',
      shop_id:'',
      attr:'',
  });
  addGroup.save(function(err){
    if(err){
      console.log(err);
    }else{
      console.log(addGroup);
    }
  })
  // }

  res.json({id:'xxxx'});
});
router.post('/chatGroupMessage',function(req,res,next){
  var group_id = req.body.group_id;
  var session_id = req.body.id;
  var userGroupChat = [];
  var listChatGroup = [];
  Group.findOne({_id:db.ObjectId(group_id),member:db.ObjectId(session_id)}).lean().exec(function(err,resultMessage){
    Group_message.find({group_id:db.ObjectId(resultMessage._id)}).sort({post_time: 'asc'}).lean().exec(function(err,resultGroupMessage){
         resultGroupMessage.forEach(function(resultGroupMessage){
           userGroupChat.push(resultGroupMessage.user_id);
         });
         chat_tool.getUser(userGroupChat,function(user){
           var pictureList = [];
           var nameList = [];
           user.forEach(function(u){
             pictureList[u._id] = u.picture;
             nameList[u._id] = u.name;
           });
           resultGroupMessage.forEach(function(resultGroupMessage){
             if(resultGroupMessage.post_type == 'text'){
               text = entities.decode(resultGroupMessage.content);
             }else{
               text = resultGroupMessage.content
             }
             data = {
                 _id:resultGroupMessage._id,
                 group_id:resultGroupMessage.group_id,
                 user_id:resultGroupMessage.user_id,
                 content:text,
                 post_time:resultGroupMessage.post_time,
                 read_status:resultGroupMessage.read_status,
                 post_type:resultGroupMessage.post_type,
                 ip:resultGroupMessage.ip,
                 picture:pictureList[resultGroupMessage.user_id],
                 name:nameList[resultGroupMessage.user_id],
                 attr:resultGroupMessage.attr,
               }
               listChatGroup.push(data);


           });

           res.json(listChatGroup);
        });


    });
  });
});
router.post('/chatMessage',function(req,res,next){
	var session_id = req.body.id;
	var friend_id = req.body.friend_id;
  var userGroupChat_p = [];
  var listChatGroup_p = [];
	Group.findOne({$and:[{member:db.ObjectId(session_id)} , {member:db.ObjectId(friend_id)} ],group_type:'p'}).lean().exec(function(err,resultMessage){
		if(resultMessage == null){
			res.json('err');
		}else{
			Group_message.find({group_id:db.ObjectId(resultMessage._id)}).sort({post_time: 'asc'}).lean().exec(function(err,resultGroupMessage){
        resultGroupMessage.forEach(function(resultGroupMessage){
          userGroupChat_p.push(resultGroupMessage.user_id);
        });
        chat_tool.getUser(userGroupChat_p,function(user){
          var pictureList_p = [];
          var nameList_p = [];
          user.forEach(function(u){

            pictureList_p[u._id] = u.picture;
            nameList_p[u._id] = u.name;
          });
          resultGroupMessage.forEach(function(resultGroupMessage){

            if(resultGroupMessage.post_type == 'text'){
              text = entities.decode(resultGroupMessage.content);
            }else{
              text = resultGroupMessage.content
            }
            data = {
                _id:resultGroupMessage._id,
                group_id:resultGroupMessage.group_id,
                user_id:resultGroupMessage.user_id,
                content:text,
                post_time:resultGroupMessage.post_time,
                read_status:resultGroupMessage.read_status,
                post_type:resultGroupMessage.post_type,
                ip:resultGroupMessage.ip,
                picture:pictureList_p[resultGroupMessage.user_id],
                name:nameList_p[resultGroupMessage.user_id],
                attr:resultGroupMessage.attr,
              }
              listChatGroup_p.push(data);


          });
          res.json(listChatGroup_p);
       });
      });

		}

	});



});
router.post('/chatActivities',function(req,res,next){
	var session_id = req.body.id;
	users2 = [];
	group_data = [];
	json = []
	date_ac = [];
	shop_list = [];
	Shop.find({user_id:db.ObjectId(session_id)}).lean().exec(function(err,shop){
		shop.forEach(function(s){
			shop_list.push(db.ObjectId(s._id));
		});
		Group.find({shop_id:{$in:shop_list}}).sort({last_update: 'desc'}).lean().exec(function(err,group){
			if(err){
				console.log(err);
			}else{
				group.forEach(function(g){
					if(g.shop_id.length != 0){
						if(g.member[0] == session_id){
							users2.push(g.member[1]);
							group_data[g.member[1]] = g._id;
							date_ac[g.member[1]]= g.last_update;
						}else{
							users2.push(g.member[0]);
							group_data[g.member[0]] = g._id;
							date_ac[g.member[0]]= g.last_update;
						}
					}
				});
				chat_tool.getUser(users2,function(user){
					user.forEach(function(u){
						json.push({gid:group_data[u._id],_id:u._id,name:u.name,picture:u.picture,status:'user',date:date_ac[u._id]});
					});
					res.json(user);
				})
			}
		});

	});
});
router.post('/useronline',function(req,res,next){
  var user_online = [];
	var json_online = [];
	var data_online = [];
	var status_online = [];
	req.body.forEach(function(u){
		user_online.push(db.ObjectId(u));
	});
	User_online.find({user_id: { $in: user_online },status_online:1 }).lean().exec(function(err,online){
		online.forEach(function(o){
			var d = new Date();
			if(o.status_online != 0){

				if(o.dt  > Math.floor(d.getTime()/1000) - 300){
					status_online[o.user_id] = 1;
				}else{
					status_online[o.user_id] = 2;
				}
			}else{
				status_online[o.user_id] = 0;
			}

			data_online.push(db.ObjectId(o.user_id));
		})
		data_online.getUnique().forEach(function(online1){
			json_online.push({_id:online1,status_online:status_online[online1]});
		})
		res.json(json_online);

	});
});

router.post('/chatgroup',function(req,res,next){
	var session_id = req.body.id;
	data_group = [];
	users1 = [];
	var i = 0;
	 Group.find({member:db.ObjectId(session_id),group_type:'g'}).sort({last_update: 'desc'}).lean().exec(function(err,group){
		 if(err){
			 console.log(err)
		 }else{
       group.forEach(function(g){
			 	Users.find({ _id: { $in: g.member } }).lean().exec(function(err,u){
					u.forEach(function(un){
						if(un.avatar != null){
							img = un.avatar
				        }else{
					        img = 'assets/images/blank_user.png'
						}
						data_user = {name:un.first_name+' '+un.last_name,picture:img}
						users1.push(data_user);
					});
					data = {groupid:g._id,name_group:g.group_name,user:users1}
					data_group.push(data);
					users1 = [];

					i++;
					if(i === group.length){
						res.json(data_group);
					}

				});


			 });

		 }
	 })


});
router.get('/chatshop',function(req,res,next){
	var session_id = req.body.id;

});
router.post('/chatlist', function(req, res, next) {
  var session_id = req.body.id;
  var group = [];
  var user = [];
  var list_chat = [];
  var friend = [];
  async.waterfall([
    function(callback) {
	    Group.find({member:db.ObjectId(session_id),group_type:'p'}).sort({last_update: 'desc'}).lean().exec(function(err,group){
    if(err){
			console.log(err);
    }else{
			users = [];
			check_u = [];
			shop = [];
			date = [];
      gid = [];
      if(group.length == 0){
        callback(null,'');
      }
			group.forEach(function(ck){

        if(ck.member[0] == session_id){
					check_u.push(ck.member[1]);
					date[ck.member[1]] = ck.last_update;
          gid[ck.member[1]] = ck._id;

				}else{
					check_u.push(ck.member[0]);
					date[ck.member[0]]= ck.last_update;
          gid[ck.member[0]] = ck._id;
				}
			});
      var i = 0;
      check_u.forEach(function(id){
        Users.findOne({_id:db.ObjectId(id)}).lean().exec(function(err,user){
          if(err){
						console.log('err');
					}else{
						if(user != null){
							if(user.avatar != null){
								img = user.avatar
				        	}else{
					        	img = 'assets/images/blank_user.png'
							    }
							    users.push({gid:gid[user._id],_id:user._id,name:user.first_name+' '+user.last_name,picture:img,status:'user',date:date[user._id]})

              i++;
						}else{
							i++;
						}
					}
					if(i === check_u.length){
						users.sort(function(a,b) {
						 	return b.date - a.date;
		  			});
            data = {group:check_u,users:users,gid}

						callback(null,data);
			    }
				});
      });
		}
	});
    },
    function(data, callback) {
      if(data.length != 0){
        list = data.users;
        var i = 0;
        data.group.forEach(function(group){

          Shop.findOne({_id:db.ObjectId(group)}).lean().exec(function(err,shop){
            if(shop != null){
              list.push({gid:data.gid[shop._id],_id:shop._id,name:shop.shop_name,picture:shop.shop_logo,status:'shop'});
              i++;
            }else{
              i++;
            }

            if(i === data.group.length){
              var data1 = {group:data.group,list:list,gid:data.gid}
              callback(null,data1);
              }

          });
        })
      }else{
        var list = []
        callback(null,'')
      }

	},
	function (data,callback){

		friendlist = []

		Friend.find({$or: [ { user_id:db.ObjectId(session_id) }, { user_id_res:db.ObjectId(session_id)}],status:1}).lean().exec(function(err,friend){

			friend.forEach(function(f){
				if(f.user_id == session_id){
					if(check_ne(data.group,f.user_id_res)){
						friendlist.push(f.user_id_res);
					}

				}else{

					if(check_ne(data.group,f.user_id)){
						friendlist.push(f.user_id);
					}
				}
			})
      if(data.list != null){
        	list = data.list;
      }else{
        var list = [];
      }

			var i = 0;
			friendlist.forEach(function(id){
				Users.findOne({_id:db.ObjectId(id)}).lean().exec(function(err,user){
					if(err){
						console.log('err');
					}else{
						if(user != null){
							if(user.avatar != null){
								img = user.avatar
				        	}else{
					        	img = 'assets/images/blank_user.png'
							}
							list.push({_id:user._id,name:user.first_name+' '+user.last_name,picture:img,status:'user'})
							i++;
						}else{
							i++;
						}
					}

					if(i === friendlist.length){
						callback(null,list);
		      }
				});

			});



		})

	}
	 ], function(err, result) {
    if (err) console.log('err');

	res.json(result);
    console.log('processed successfully using async lib11');

  });
});
function check_ne(simple,val){
	check = true;

	if(simple != null){

		simple.forEach(function(s){

			if(s+'' == val+''){

				check = false;

			}
		});

	}

	return check;
}


module.exports = router;
