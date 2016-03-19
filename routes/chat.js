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
 
  res.render('chat1');
});
router.post('/useronline',function(req,res,next){
	var user = [];
	req.body.forEach(function(u){
		user.push(db.ObjectId(u));
	});
	//console.log(user);
	
	User_online.find({user_id: { $in: user } }).lean().exec(function(err,online){
		console.log(online);
	});
	//var useronline = req.body.id;
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
						//console.log(users1);
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
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}


module.exports = router;
