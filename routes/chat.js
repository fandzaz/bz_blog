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
router.get('/user/:id', function(req, res, next) {
 	res.render('chat2',{id:req.params.id});
});

router.get('/master', function(req, res, next) {
	res.render('chat3');
});
router.get('/uploads', function(req, res, next) {
	res.render('upload');
});
router.get('/uploadsChat', function(req, res, next) {
  var files = req.files.file;
  console.log(files);
  // if (Array.isArray(files)) {
  //     // response with multiple files (old form may send multiple files)
  //     console.log("Got " + files.length + " files");
  // }
  // else {
  //     // dropzone will send multiple requests per default
  //     console.log("Got one file");
  // }
  // res.status(204);
  // res.send();
});

router.post('/addActivities',function(req,res,next){
  var user_id = req.body.user_id;
  var session_id = req.body.id;
  Group.findOne({$and: [ { member:db.ObjectId(session_id) }, { member:db.ObjectId(user_id)}]}).lean().exec(function(err,result){
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
    var addGroup = new Group_message({
      group_id:db.ObjectId(gid),
      user_id:db.ObjectId(user_id),
      content:Entities.encode(message),
      post_time:function_t.getTime(),
      read_status:0,
      post_type:'text',
      ip:function_t.getIpv4(req.clientIp),
      shop_id:'',
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
      chat_tool.getUersOne(addGroup.user_id,function(data){
          //addGroup.content = message;
          //addGroup.picture = 'xfsdfsdf';
          res.json({chat:addGroup,picture:data.picture});
          console.log(addGroup);
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
//	Group.findOne({$and:[{member:db.ObjectId(session_id)} , {member:db.ObjectId(friend_id)} ],group_type:'p'}).lean().exec(function(err,resultMessage){
		// if(resultMessage == null){
		// 	res.json('err');
		// }else{
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
    shopUser.forEach(function(row,i){
      shoplist_ca.push(row._id);
      shopListId[row._id] = row._id
      shopname_ca[row._id] = row.shop_name;
    });
    Group.find({shop_id:{$in:shoplist_ca},group_type:'p'}).sort({last_update: 'desc'}).lean().exec(function(err,groupShop){
      var shoplistId_ca = [];
      var id = '';
      if(groupShop.length != 0){
        var userFinal_ca = [];
        groupShop.forEach(function(ck,i){
          if(shopListId[ck.member[0]] == ck.member[0]){
            id = ck.member[1];
            shop_name = shopname_ca[ck.shop_id];
          }else{
            id = ck.member[0];
            shop_name = shopname_ca[ck.shop_id];
          }
          chat_tool.getUersOne(id,function(rsUser){
            var data1 = {_id:rsUser._id,name:rsUser.name,shop_id:shopListId[ck.shop_id],shop_name:shopname_ca[ck.shop_id],gid:ck._id,picture:rsUser.picture,last_update:ck.last_update,status:'user'};
            userFinal_ca.push(data1);
            if(groupShop.length == (i+1)){
              chat_tool.findGroupGetWhere(session_id,'p','shop',function(resultShop){
                console.log(resultShop);
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
              });
            }
          });
        });
      }else{
        chat_tool.findGroupGetWhere(session_id,'p','shop',function(resultShop){
          //console.log(resultShop);
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
        });
      }
    });
  });
  // Group.find({member:db.ObjectId(session_id),group_type:'p'}).sort({last_update: 'desc'}).lean().exec(function(err,group){
  //   var groupData = [];
  //   var date = [];
  //   var gid = [];
  //   if(group.length != 0){
  //     group.forEach(function(ck){
  //       if(ck.member[0] == session_id){
  //         groupData.push(ck.member[1]);
  //         date[ck.member[1]] = ck.last_update;
  //         gid[ck.member[1]] = ck._id;
  //       }else{
  //         groupData.push(ck.member[0]);
  //         date[ck.member[0]]= ck.last_update;
  //         gid[ck.member[0]] = ck._id;
  //       }
  //     });
  //   }
  //   chat_tool.getUserChat(groupData,function(result){
  //
  //     res.json(result);
  //   });
  // });
	// Shop.find({user_id:db.ObjectId(session_id)}).lean().exec(function(err,shop){
	// 	shop.forEach(function(s){
	// 		shop_list.push(db.ObjectId(s._id));
	// 	});
	// 	Group.find({shop_id:{$in:shop_list}}).sort({last_update: 'desc'}).lean().exec(function(err,group){
	// 		if(err){
	// 			console.log(err);
	// 		}else{
	// 			group.forEach(function(g){
	// 				if(g.shop_id.length != 0){
	// 					if(g.member[0] == session_id){
	// 						users2.push(g.member[1]);
	// 						group_data[g.member[1]] = g._id;
	// 						date_ac[g.member[1]]= g.last_update;
	// 					}else{
	// 						users2.push(g.member[0]);
	// 						group_data[g.member[0]] = g._id;
	// 						date_ac[g.member[0]]= g.last_update;
	// 					}
	// 				}
	// 			});
	// 			chat_tool.getUser(users2,function(user){
	// 				user.forEach(function(u){
	// 					json.push({gid:group_data[u._id],_id:u._id,name:u.name,picture:u.picture,status:'user',date:date_ac[u._id]});
	// 				});
	// 				res.json(user);
	// 			})
	// 		}
	// 	});
  //
	// });
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
     data_group = [];
   	 users1 = [];
		 if(err){
			 console.log(err)
		 }else{
       var i = 0;
       group.forEach(function(g){
         chat_tool.getUser(g.member,function(resultUserGroup){
           var dataGroup = {groupid:g._id,name_group:g.group_name,user:resultUserGroup,last_update:g.last_update}
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

      //  group.forEach(function(g){
			//  	Users.find({ _id: { $in: g.member } }).lean().exec(function(err,u){
			// 		u.forEach(function(un){
			// 			if(un.avatar != null){
			// 				img = un.avatar
			// 	        }else{
			// 		        img = 'assets/images/blank_user.png'
			// 			}
			// 			data_user = {name:un.first_name+' '+un.last_name,picture:img}
			// 			users1.push(data_user);
			// 		});
			// 		data = {groupid:g._id,name_group:g.group_name,user:users1}
			// 		data_group.push(data);
			// 		users1 = [];
       //
			// 		i++;
			// 		if(i === group.length){
			// 			res.json(data_group);
			// 		}
       //
			// 	});
       //
       //
			//  });

		 }
	 })


});
router.get('/chatshop',function(req,res,next){
	var session_id = req.body.id;
});
router.post('/chatList1', function(req, res, next) {
    var session_id1 = req.body.id;
    console.log(session_id1);
    Group.find({member:db.ObjectId(session_id1),group_type:'p'}).sort({last_update: 'desc'}).lean().exec(function(err,group){//ดึงข้อมูลกลุ่ม

      check_u1 = [];
      date = [];
      gid = [];
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
          users_list = [];
          // chat_tool.checkFriend(session_id1,function(friend){
          //   console.log(friend);
          // });
          result_user.forEach(function(user_list){
            users_list.push({gid:gid[user_list._id],_id:user_list._id,name:user_list.name,picture:user_list.picture,status:user_list.status,date:date[user_list._id],status_friend:user_list.status_friend})
          });
          users_list.sort(function(a, b){
            return b.date-a.date
          });
          test = [];
          //res.json(users_list);
          //res.json(users);

            chat_tool.getFriend(session_id1,check_u1,function(f){
              var dataAlluser = [];
              f.forEach(function(fu){
                dataAlluser.push({_id:fu._id,name:fu.name,picture:fu.picture,status_friend:true});
              });
              var alldatauser = users_list.concat(dataAlluser);

              res.json(alldatauser);

            })


        });
        }else{
          users_list = [];

            chat_tool.getFriend(session_id1,check_u1,function(f){
              f.forEach(function(f){
                users_list.push({_id:f._id,name:f.name,picture:f.picture,status:f.status,date:date[f._id],status_friend:true});
              });
              res.json(users_list);
            })


        }
    });


});
// router.post('/chatlist', function(req, res, next) {
//   var session_id = req.body.id;
//   var group = [];
//   var user = [];
//   var list_chat = [];
//   var friend = [];
//   async.waterfall([
//     function(callback) {
// 	    Group.find({member:db.ObjectId(session_id),group_type:'p'}).sort({last_update: 'asc'}).lean().exec(function(err,group){
//         if(err){
// 			       console.log(err);
//         }else{
//     			users = [];
//     			check_u = [];
//     			shop = [];
//     			date = [];
//           gid = [];
//           if(group.length == 0){
//             callback(null,'');
//           }
// 			    group.forEach(function(ck){
//             if(ck.member[0] == session_id){
//     					check_u.push(ck.member[1]);
//     					date[ck.member[1]] = ck.last_update;
//               gid[ck.member[1]] = ck._id;
//
//     				}else{
//     					check_u.push(ck.member[0]);
//     					date[ck.member[0]]= ck.last_update;
//               gid[ck.member[0]] = ck._id;
//     				}
// 			    });
//       var i = 0;
//
//       check_u.forEach(function(id){
//         Users.findOne({_id:db.ObjectId(id)}).lean().exec(function(err,user){
//           if(err){
// 						console.log('err');
// 					}else{
// 						if(user != null){
// 							if(user.avatar != null){
// 								img = user.avatar
// 				        	}else{
// 					        	img = 'assets/images/blank_user.png'
// 							    }
// 							    users.push({gid:gid[user._id],_id:user._id,name:user.first_name+' '+user.last_name,picture:img,status:'user',date:date[user._id]})
//
//               i++;
// 						}else{
// 							i++;
// 						}
// 					}
// 					if(i === check_u.length){
// 						users.sort(function(a,b) {
// 						 	return b.date - a.date;
// 		  			});
//             data = {group:check_u,users:users,gid}
//
// 						callback(null,data);
// 			    }
// 				});
//       });
// 		}
// 	});
//     },
//     function(data, callback) {
//       if(data.length != 0){
//         list = data.users;
//         var i = 0;
//         data.group.forEach(function(group){
//
//           Shop.findOne({_id:db.ObjectId(group)}).lean().exec(function(err,shop){
//             if(shop != null){
//               list.push({gid:data.gid[shop._id],_id:shop._id,name:shop.shop_name,picture:shop.shop_logo,status:'shop'});
//               i++;
//             }else{
//               i++;
//             }
//
//             if(i === data.group.length){
//               var data1 = {group:data.group,list:list,gid:data.gid}
//               callback(null,data1);
//               }
//
//           });
//         })
//       }else{
//         var list = []
//         callback(null,'')
//       }
//
// 	},
// 	function (data,callback){
//
// 		friendlist = []
//
// 		Friend.find({$or: [ { user_id:db.ObjectId(session_id) }, { user_id_res:db.ObjectId(session_id)}],status:1}).lean().exec(function(err,friend){
//
// 			friend.forEach(function(f){
// 				if(f.user_id == session_id){
// 					if(check_ne(data.group,f.user_id_res)){
// 						friendlist.push(f.user_id_res);
// 					}
//
// 				}else{
//
// 					if(check_ne(data.group,f.user_id)){
// 						friendlist.push(f.user_id);
// 					}
// 				}
// 			})
//       if(data.list != null){
//         	list = data.list;
//       }else{
//         var list = [];
//       }
//
// 			var i = 0;
// 			friendlist.forEach(function(id){
// 				Users.findOne({_id:db.ObjectId(id)}).lean().exec(function(err,user){
// 					if(err){
// 						console.log('err');
// 					}else{
// 						if(user != null){
// 							if(user.avatar != null){
// 								img = user.avatar
// 				        	}else{
// 					        	img = 'assets/images/blank_user.png'
// 							}
// 							list.push({_id:user._id,name:user.first_name+' '+user.last_name,picture:img,status:'user'})
// 							i++;
// 						}else{
// 							i++;
// 						}
// 					}
//
// 					if(i === friendlist.length){
// 						callback(null,list);
// 		      }
// 				});
//
// 			});
//
//
//
// 		})
//
// 	}
// 	 ], function(err, result) {
//     if (err) console.log('err');
//
// 	res.json(result);
//     console.log('processed successfully using async lib11');
//
//   });
// });
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
