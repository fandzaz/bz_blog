var express = require('express');
var router = express.Router();
var Group = require('mongoose').model('group');
var Users = require('mongoose').model('users');
var Shop = require('mongoose').model('shop');
var Friend = require('mongoose').model('friend');
var Group_message = require('mongoose').model('group_message');
var User_online = require('mongoose').model('user_online');
/* GET home page. */
router.get('/', function(req, res, next) {
 	res.render('chat2');
});
router.get('/master', function(req, res, next) {
	res.render('chat3');
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
	//return $this->cimongo->where(array('user_id' => new mongoid($key),'status_online'=>1))->get($this->table_user_online)->row();
/*
	if(!empty($data)){
			if($data->dt > time()-300){
				$data_status['status'] = 1;
			}else{
				$data_status['status'] = 2;
			}
			
		}else{
			$data_status['status'] = 0;
		}
*/
	var user_online = [];
	var json_online = [];
	var data_online = [];
	var status_online = [];
	req.body.forEach(function(u){
		user_online.push(db.ObjectId(u));
	});
	User_online.find({user_id: { $in: user_online },status_online:1 }).lean().exec(function(err,online){
		console.log(online)
		
		online.forEach(function(o){
			var d = new Date();
			console.log(o.dt+'===='+d.getTime());
			if(o.status_online != 0){
				if(o.dt > d.getTime() - 300){
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
	//console.log(req.body.id);
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
			group.forEach(function(ck){
				
				if(ck.member[0] == session_id){
					check_u.push(ck.member[1]);
					date[ck.member[1]] = ck.last_update;
				}else{
					check_u.push(ck.member[0]);
					date[ck.member[0]]= ck.last_update;
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
							users.push({_id:user._id,name:user.first_name+' '+user.last_name,picture:img,status:'user',date:date[user._id]})
							
							i++;
						}else{
							i++;
						}
					}
					if(i === check_u.length){
						 users.sort(function(a,b) {
						 	return b.date - a.date;
		  				});
						data = {group:check_u,users:users}
						callback(null,data);
			        }
				});

			});
		}
	});
    },
    function(data, callback) {
	 	list = data.users;
	 	var i = 0;
	 	data.group.forEach(function(group){
			 
			Shop.findOne({_id:db.ObjectId(group)}).lean().exec(function(err,shop){
				if(shop != null){
					list.push({_id:shop.user_id,name:shop.shop_name,picture:shop.shop_logo,status:'shop'});
					i++;
				}else{
					i++;
				}
				
				if(i === data.group.length){
					var data1 = {group:data.group,list:list}
					callback(null,data1);
			    }
				
			});
		})
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
			list = data.list;
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
