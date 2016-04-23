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
var upload = libUpload.upload();
var uploadGroup = libUpload.uploadGroup();
// var upload = multer({ dest: 'uploads/' }).array('file', 12);
/* GET home page. */
router.get('/user/:id', function(req, res, next) {
 	res.render('chat2',{id:req.params.id});
});
router.get('/emo', function(req, res, next) {
	res.render('emoticon');
});
router.get('/master', function(req, res, next) {
	res.render('chat3');
});
router.get('/showFriend/:gid', function(req, res, next) {
  res.render('friend',{gid:req.params.gid});
});
router.get('/addFriend/:gid',function(req,res,next){
  res.render('friend_group',{gid:req.params.gid});
});
router.get('/setting/:gid', function(req, res, next) {
  var gid = req.params.gid;
  Group.findOne({_id:db.ObjectId(gid)}).lean().exec(function(err,group){
    if(group.pictureGroup){
      img = '/uploads/'+group.pictureGroup
   }else{
      img = 'http://27.254.81.103:7001/90x90/uploads/avatar_56e273eff0d71dff138b4567_1668053170.jpg';
    }
    res.render('setting',{gid:group._id,group_name:group.group_name,picture:img});
  });

});
router.get('/uploads', function(req, res, next) {
	res.render('upload');
});
router.post('/addFriendGroup', function(req, res, next) {
  var gid = req.body.gid;
  var user_id = req.body.user_id;
  var groupNew = [];
  Group.findOne({
    $and:[
          {_id:db.ObjectId(gid)},
          {member:{$ne:db.ObjectId(user_id)}}
        ]
  }).lean().exec(function(err,resultGroup){
    if(resultGroup != null){
      groupNew = resultGroup.member
      groupNew.push(db.ObjectId(user_id));
      Group.findOneAndUpdate({_id:db.ObjectId(gid)},{member:groupNew},function(err,result){
        res.json(resultGroup);
      })

    }

  });
});
router.post('/lastRead', function(req, res, next) {
  var gid = req.body.gid;
  var listUser = [];
  Group_message.findOne({group_id:db.ObjectId(gid)}).sort({post_time:'desc'}).lean().exec(function(err,resultMessage){
    if(resultMessage != null){
      resultMessage.read_list.forEach(function(r){
        listUser.push(r);
      });
      chat_tool.getUser(listUser,function(user){
        res.json(user);
      });
    }else{
      res.json(resultMessage);
    }

  });
});
router.post('/readCaht', function(req, res, next) {
  var session_id = req.body.session_id;
  var gid = req.body.gid;
  var read_list = [];
  Group_message.findOne({group_id:db.ObjectId(gid),user_id:{$ne:db.ObjectId(session_id)}}).sort({post_time:'-1'}).lean().exec(function(err,resultMessage){
    if(resultMessage != null){
      if(function_t.inArray(session_id,resultMessage.read_list)){
        res.json(resultMessage);
      }else{
        read_list = resultMessage.read_list;
        read_list.push(db.ObjectId(session_id));
        Group_message.findOneAndUpdate({_id:resultMessage._id},{read_list:read_list},function(err,result){
          res.json(result);
        })
      }
    }else{
      res.json(resultMessage);
    }
  });
});
//Group.find({$or{[]} member:db.ObjectId(session_id)}).lean().exec(function(err,resultGroup){
router.post('/loadNotification', function(req, res, next) {
  var session_id = req.body.session_id;
  var listGroup = [];
  var notification = [];
  var num = 0;
  var i = 0;
  var text = '';
  Shop.find({user_id:db.ObjectId(session_id)}).lean().exec(function(err,resultShop){
    var shopList = [];
    console.log(resultShop);
    resultShop.forEach(function(shop){
      shopList.push(shop._id);
    });
    Group.find({ $or:[{member:{$in:shopList}},{member:db.ObjectId(session_id)}]  } ).lean().exec(function(err,resultGroup){

      console.log(resultGroup)
      resultGroup.forEach(function(g){
        Group_message.findOne({group_id:g._id,user_id:{$ne:db.ObjectId(session_id)}}).sort({post_time:'-1'}).lean().exec(function(err,resultMessage){
          //console.log(resultMessage);
          if(resultMessage != null){
            if(resultMessage.post_type == 'text'){
              resultMessage.content = entities.decode(resultMessage.content);
            }else{
              resultMessage.content = "ส่งรูปภาพ";
            }
            if(!function_t.inArray(session_id,resultMessage.read_list)){
              resultMessage.status_read = true;
              notification.push(resultMessage);
              num++;
            }else{
              resultMessage.status_read = false;
              notification.push(resultMessage);
            }
          }
          i++;
          if(resultGroup.length == i){

            res.json({num_notification:num,notification:notification});
          }
        });
      });
    });
  });

});
router.post('/getFriend', function(req, res, next) {
  var session_id = req.body.session_id;
  var gid = req.body.gid;
  var user = [];
  var group = [];
  chat_tool.getFriendAll(session_id,function(friend){
    Group.findOne({_id:db.ObjectId(gid)}).lean().exec(function(err,group){
      friend.forEach(function(f){
        if(check_ne(group.member,f)){
          user.push(f)
        }
      });
      chat_tool.getUser(user,function(data_user){
        res.json(data_user);
      });
    });

  });
});
router.post('/uploadGroup', function(req, res, next) {
  uploadGroup(req, res, function (err) {
    var gid =  req.body.gid;
    if(err){console.log(err)}
    else{
      Group.findOneAndUpdate({_id:db.ObjectId(gid)},{pictureGroup:req.file.filename},function(err,result){
          res.json({_id:result._id,picture:'/uploads/'+req.file.filename});
      });
    }
  })
});
router.post('/delUserGroup', function(req, res, next) {
  var user_id = req.body.user_id;
  var gid = req.body.gid;
  var newUserGroup = [];
  Group.findOne({_id:db.ObjectId(gid),member:db.ObjectId(user_id)}).lean().exec(function(err,resultGroup){

    if(resultGroup.member.length > 2){

      resultGroup.member.forEach(function(m){
        if(user_id != m){
          newUserGroup.push(db.ObjectId(m));
        }
      });
      Group.findOneAndUpdate({_id:db.ObjectId(gid)},{member:newUserGroup},function(err,result){
        Group_member.find({ group_id:db.ObjectId(gid),user_id:db.ObjectId(user_id) }).remove().exec(function(err,del){
          res.json(del);
        });
      })
    }else{

      Group.find({_id:db.ObjectId(gid)}).remove().exec(function(err,delGroup){
        Group_member.find({ group_id:db.ObjectId(gid)}).remove().exec(function(err,del){
          res.json(del);
        });
      });
      //res.json('not del');
    }


    console.log(newUserGroup);

  });
  //console.log(gid);
});
router.post('/uploadChat', function(req, res, next) {
  var img = [];
  upload(req, res, function (err) {
    var user_id = req.body.user_id;
    var gid_uc = req.body.gid;

    if(err){
      console.log(err)
    }else{
      req.files.forEach(function(photo){
        img.push(photo.filename);
      });
      var addGroup = new Group_message({
        group_id:db.ObjectId(gid_uc),
        user_id:db.ObjectId(user_id),
        content:img,
        post_time:function_t.getTime(),
        read_status:0,
        post_type:'image',
        ip:function_t.getIpv4(req.clientIp),
        shop_id:'',
        attr:'',
      });
      addGroup.save(function(err){
        if(err){
          console.log(err);
        }else{
          Group.findOneAndUpdate({_id:db.ObjectId(gid_uc)},{last_update:function_t.getTime()},function(err,update){
            if(err){
              console.log(err);
            }
            Group_member.findOneAndUpdate({group_id:db.ObjectId(gid_uc)},{last_update:function_t.getTime()},function(err,member){})
          });
          chat_tool.getUersOne(addGroup.user_id,function(data){
              res.json({chat:addGroup,picture:data.picture});
              console.log(addGroup);
          });
        }
      })
    }
  });
});
router.post('/updateNameGroup',function(req,res,next){
  var user_id = req.body.user_id;
  var gid = req.body.gid;
  var name = req.body.name;
  Group.find({$and:[{_id:db.ObjectId(gid)},{member:db.ObjectId(user_id)}]}).lean().exec(function(err,checkGroup){
    if(checkGroup.length != 0){
      Group.findOneAndUpdate({_id:db.ObjectId(gid)},{group_name:name},function(err,group){
        res.json(group)
      });
    }
  });
});
router.post('/addGroup',function(req,res,next){
  var id = req.body.id;
  var friend_id = req.body.friend_id;
  var user_id = req.body.user_id;
  chat_tool.checkFriendSingle(id,friend_id,function(f){

    if(f.status){

      var group = new Group({
        group_name:id+"-"+function_t.getTime(),
        group_type:'g',
        member:[db.ObjectId(id),db.ObjectId(friend_id),db.ObjectId(user_id)],
        last_update:function_t.getTime(),
        pictureGroup:''
      });
      group.save(function(err){
        if(err){
          console.log(err);
        }else{
          var group1 = Group_member({
            user_id:db.ObjectId(id),
            group_id:db.ObjectId(group._id),
            join_date:function_t.getTime(),
            last_update:function_t.getTime(),
          });
          var group2 = Group_member({
            user_id:db.ObjectId(friend_id),
            group_id:db.ObjectId(group._id),
            join_date:function_t.getTime(),
            last_update:function_t.getTime(),
          });
          group1.save();
          group2.save();
          res.json(group);
        }
      })
    }
    //res.json(f);
  });
});
router.post('/findFriend',function(req,res,next){
  var session_id = req.body.id;
  var find = req.body.find;
  chat_tool.getUserByName(find,function(result){
    chat_tool.checkFriendGetID(session_id,result,function(data){
      //console.log(data);
      chat_tool.getUser(data,function(user){
        res.json(user);
      });
      //console.log(data)
    });
    //res.json(result);
  });
});
router.post('/addActivities',function(req,res,next){
  var user_id = req.body.user_id;
  var session_id = req.body.id;
  Group.findOne({$and: [ { member:db.ObjectId(session_id) }, { member:db.ObjectId(user_id)}],group_type:'p'}).lean().exec(function(err,result){
    console.log(result)
    if(result == null){
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
        }
      })
    }else{
      res.json(result);
    }
  });


});
router.post('/sendChatMessage',function(req,res,next){
    var gid = req.body.gid;
    var message = req.body.message;
    var user_id = req.body.user_id;
    var shop_id = req.body.shop_id;
    var addGroup = new Group_message({
      group_id:db.ObjectId(gid),
      user_id:db.ObjectId(user_id),
      content:Entities.encode(message),
      post_time:function_t.getTime(),
      read_status:0,
      post_type:'text',
      ip:function_t.getIpv4(req.clientIp),
      shop_id:shop_id,
      attr:'',
  });

  addGroup.save(function(err){
    if(err){
      console.log(err);
    }else{
      Group.findOneAndUpdate({_id:db.ObjectId(gid)},{last_update:function_t.getTime()},function(err,update){
        if(err){
          console.log(err);
        }
        Group_member.findOneAndUpdate({group_id:db.ObjectId(gid)},{last_update:function_t.getTime()},function(err,member){})
      });
      console.log(addGroup.user_id);
      chat_tool.getUersOne(addGroup.user_id,function(data){
          addGroup.content = message;//function_t.urlify(message);

          res.json({chat:addGroup,picture:data.picture});
          //console.log(addGroup);
      });




    }


  })

});
router.post('/chatGroupMessage',function(req,res,next){
  var group_id = req.body.group_id;
  var session_id = req.body.id;
  var userGroupChat = [];
  var listChatGroup = [];
  Group.findOne({_id:db.ObjectId(group_id),member:db.ObjectId(session_id)}).lean().exec(function(err,resultMessage){
    Group_message.find({group_id:db.ObjectId(resultMessage._id)}).sort({post_time: 'desc'}).limit(20).lean().exec(function(err,resultGroupMessage){
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
               listChatGroup.unshift(data);


           });

           res.json(listChatGroup);
        });
      });
  });
});
router.post('/loadMessageChat',function(req,res,next){
  var gid = req.body.gid;
  Group_message.find({group_id:db.ObjectId(gid)}).lean().exec(function(err,result){
    res.json(result);
  });
});
router.post('/chatMessage',function(req,res,next){
	var session_id = req.body.id;
	var friend_id = req.body.friend_id;
  var gid = req.body.gid;
  var userGroupChat_p = [];
  var listChatGroup_p = [];
	Group_message.find({group_id:db.ObjectId(gid)}).sort({post_time: 'desc'}).limit(20).lean().exec(function(err,resultGroupMessage){
    if(resultGroupMessage == null){
          res.json('err');
        }else{
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
                listChatGroup_p.unshift(data);


            });
            res.json(listChatGroup_p);
         });
         	}
        });



//	});



});
router.post('/chatActivities',function(req,res,next){
	var session_id = req.body.id;

  Shop.find({user_id:db.ObjectId(session_id)}).lean().exec(function(err,shopUser){

    var shoplist_ca = [];
    var shopname_ca = [];
    var shopListId = [];
    var checkShop = [];
    shopUser.forEach(function(row,i){
      shoplist_ca.push(row._id);
      shopListId[row._id] = row._id
      checkShop.push(row._id);
      shopname_ca[row._id] = row.shop_name;
    });

    Group.find({shop_id:{$in:shoplist_ca},group_type:'p'}).sort({last_update: 'desc'}).lean().exec(function(err,groupShop){
      //console.log(groupShop)
      var shoplistId_ca = [];
      var id = '';
      if(groupShop.length != 0){
        var userFinal_ca = [];

        groupShop.forEach(function(ck,i){

          if(!chat_tool.check_ne(checkShop,ck.member[0])){
            shop_name = shopname_ca[ck.shop_id];
            id = ck.member[1];
          }else{
            id = ck.member[0];
            shop_name = shopname_ca[ck.shop_id];
          }

          chat_tool.getUersOne(id,function(rsUser){

            var data1 = {_id:rsUser._id,name:rsUser.name,shop_id:shopListId[ck.shop_id],shop_name:shopname_ca[ck.shop_id],gid:ck._id,picture:rsUser.picture,last_update:ck.last_update,status:'user'};
            userFinal_ca.push(data1);

            if(groupShop.length == (i+1)){

              chat_tool.findGroupGetWhere(session_id,'p','shop',function(resultShop){
                if(resultShop){
                  var shopFinal = [];
                  resultShop.data.forEach(function(rsShop){
                    var data2 = {_id:rsShop._id,user_id:rsUser._id,name:rsShop.name,shop_id:rsShop._id,shop_name:rsShop.name,gid:resultShop.group[rsShop._id],picture:rsShop.picture,last_update:resultShop.last_update[rsShop._id],status:'shop'};
                    shopFinal.push(data2);
                  });
                  json_ca = userFinal_ca.concat(shopFinal);
                  json_ca.sort(function(a, b){
                    return b.last_update-a.last_update
                  });
                  res.json(json_ca);
                }else{
                  res.json(userFinal_ca);
                }
              });
            }
          });
        });
      }else{
        console.log('casexx')
        chat_tool.findGroupGetWhere(session_id,'p','shop',function(resultShop){

          if(resultShop){
            //console.log(resultShop)
            var shopFinal = [];
            resultShop.data.forEach(function(rsShop){
              var data2 = {_id:rsShop._id,name:rsShop.name,shop_id:rsShop._id,shop_name:rsShop.name,gid:resultShop.group[rsShop._id],picture:rsShop.picture,last_update:resultShop.last_update[rsShop._id],status:'shop'};
              shopFinal.push(data2);
            });

            //json_ca = userFinal_ca.concat(shopFinal);
            shopFinal.sort(function(a, b){
              return b.last_update-a.last_update
            });

            res.json(shopFinal);
        }
        });
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


	 Group.find({member:db.ObjectId(session_id),group_type:'g'}).sort({last_update: 'desc'}).lean().exec(function(err,group){
     if(group.length != 0){
       var data_group = [];
     	 var users1 = [];
  		 if(err){
  			 console.log(err)
  		 }else{
         var i = 0;
         group.forEach(function(g){
           chat_tool.getUser(g.member,function(resultUserGroup){
             if(g.pictureGroup){
               img = '/uploads/'+g.pictureGroup
            }else{
               img = 'http://27.254.81.103:7001/90x90/uploads/avatar_56e273eff0d71dff138b4567_1668053170.jpg';
             }
             var dataGroup = {groupid:g._id,name_group:g.group_name,user:resultUserGroup,last_update:g.last_update,picture:img}
             data_group.unshift(dataGroup);
             i++;
             if(i === group.length){
               data_group.sort(function(a, b){
                 return b.last_update-a.last_update
               });
               res.json(data_group);
             }
           });
         });

  		 }
     }else{
       res.json(group);
     }

	 })


});
router.get('/chatshop',function(req,res,next){
	var session_id = req.body.id;
});
router.post('/chatList1', function(req, res, next) {
    var session_id1 = req.body.id;

    Group.find({member:db.ObjectId(session_id1),group_type:'p'}).sort({last_update: 'desc'}).lean().exec(function(err,group){//ดึงข้อมูลกลุ่ม

      var check_u1 = [];
      var date = [];
      var gid = [];
      //users_list = [];
      if(group.length != 0){

        group.forEach(function(ck){
          if(ck.member[0] == session_id1){
            check_u1.push(ck.member[1]);
            date[ck.member[1]] = ck.last_update;
            gid[ck.member[1]] = ck._id;
          }else{
            check_u1.push(ck.member[0]);
            date[ck.member[0]]= ck.last_update;
            gid[ck.member[0]] = ck._id;
          }
        });

        chat_tool.getUserChat(session_id1,check_u1,function(result_user){
          var users_list = [];

          result_user.forEach(function(user_list){
            users_list.push({gid:gid[user_list._id],_id:user_list._id,name:user_list.name,picture:user_list.picture,status:user_list.status,date:date[user_list._id],status_friend:user_list.status_friend})
          });
          users_list.sort(function(a, b){
            return b.date-a.date
          });
          //res.json(users_list);
            chat_tool.getFriend(session_id1,check_u1,function(f){

              dataAlluser = [];
              f.forEach(function(fu){
                dataAlluser.push({_id:fu._id,name:fu.name,picture:fu.picture,status_friend:true});
              });
              var alldatauser = users_list.concat(dataAlluser);

              res.json(alldatauser);

            })


        });
        }else{


            chat_tool.getFriend(session_id1,check_u1,function(f){
              users_list = [];
              f.forEach(function(f){
                users_list.push({_id:f._id,name:f.name,picture:f.picture,status:f.status,date:date[f._id],status_friend:true});
              });
              res.json(users_list);
            })


        }
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
