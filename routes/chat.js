var express = require('express');
var router = express.Router();
var Group = require('mongoose').model('group');
var Users = require('mongoose').model('users');
/* GET home page. */
router.get('/', function(req, res, next) {
 
  res.render('chat1');
});


router.get('/chatshop',function(req,res,next){
	var session_id = req.body.id;
/*
	var board = new Webboard_header();
	board.aut = db.ObjectId('56ebb98f9a7876b305c5d134');
*/
	
	
/*
	web = new Webboard_header() 
	web.aut = db.ObjectId('56ebb98f9a7876b305c5d134');
*/
	
/*
	Webboard_header.find({}).populate('user_id').exec(function(err,post){
		if(err){
			console.log(err);
		}else{
			console.log(post);
		}
	})
*/

	//console.log(Webboard_header);
	Group.find({member:db.ObjectId(session_id)}).lean().exec(function(err,post){
		
		users = []
		if(err){
			console.log(err);
		}else{
			console.log(post);
			post.forEach(function(s){
				Users.find({_id:s.member[0]}).lean().exec(function(err,u){
					if(u.avatar != null){
			          	img = u.avatar 
			        }else{
				        img = 'assets/images/blank_user.png'
			        }
					users.push({_id:u._id,name:u.first_name+' '+u.last_name,picture:img,status:'user'})
					if(users.length === post.length){
			            //console.log(users);
			        }
				});
			});
		}
	});


/*
	Group.find({},function(err,data1){
		if(err){
			console.log(err);
		}else{
			
			//console.log(s);
			if(data1[0].isArray){
				console.log('1');
			}else{
				console.log('2');
			}

			console.log(data1[0].member);

		}
		
	})
*/



/*
	user.save(function(err){
		if(err){
			console.log(err);
		}else{
			console.log(user);
		}
	})
*/
	//user = new user()
	
	 console.log('ssss');
	
	
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
	    Group.find({member:db.ObjectId(session_id)}).lean().exec(function(err,post){
		    console.log(post);
		users = []
		if(err){
			console.log(err);
		}else{
			
			post.forEach(function(s){
				
				Users.find({_id:s.member[0]}).lean().exec(function(err,u){
					if(u.avatar != null){
			          	img = u.avatar 
			        }else{
				        img = 'assets/images/blank_user.png'
			        }
					users.push({_id:u._id,name:u.first_name+' '+u.last_name,picture:img,status:'user'})
					if(users.length === post.length){
			            callback(null,users);
			        }
				});
			});
		}
	});

	    
	  
/*
      db.find('Bzn_group',{member:db.ObjectId(session_id)},function(data){
	      data.forEach(function(item){
			  user.push(item.member[0]);
			  user.push(item.member[1]);
			  group.push(item._id);
      	});
      	var data = {u:user}
	    callback(null, data);
	  });
*/
	  
    },
    function(data, callback) {
	console.log(data);
	callback(null,data);
		
/*
	    db.find('Bzn_shop',{ _id: { $in: data.u } },function(shop_user){
		    
		    var i = 0;
	          shop_user.forEach(function(shop){
	            if(shop.user_id != session_id){
		          list_chat.push({_id:shop.user_id,name:shop.shop_name,picture:shop.shop_logo,status:'shop'});
	              i++;
	            }
	
	          });
	        var data1 = {u:data.u,list:list_chat}
	        callback(null,data1);
	         
		});
*/
	},
	function (data,callback){
		callback(null,data);
		//var data1 = {u:data.u,list:list_chat}
/*
		var friendlist = [];
		var check_u = []
		data.u.forEach(function(u){
			if(u != session_id){
				friendlist.push(u);
				check_u.push(u);
			}
				
		})
		var list = check_u;
		
		db.find('Bzn_friend',{ $or: [ { user_id:db.ObjectId(session_id) }, { user_id_res:db.ObjectId(session_id)}],status:1},function(friend){
			
			friend.forEach(function(f){
				
				if(f.user_id == session_id){
					if(check_ne(list,f.user_id_res)){
						friendlist.push(f.user_id_res);
					}
					
				}else{
					
					if(check_ne(list,f.user_id)){
						friendlist.push(f.user_id);
					}
				}
				
			})
			
			var data1 = {u:friendlist,list:list_chat}
			callback(null,data1);
			
		})
*/
		
	},
	 function(data,callback){
		 callback(null,data);
/*
		 list_chat = data.list;
		 console.log(list_chat);
		 db.find('Bzn_users',{ _id: { $in: data.u } },function(data_user){
			 console.log(data_user);
			 var i = 0;
	          data_user.forEach(function(user){
	           	
		          if(user.avatar != null){
			          img = user.avatar 
		          }else{
			          img = 'assets/images/blank_user.png'
		          }
	              list_chat.push({_id:user._id,name:user.first_name+' '+user.last_name,picture:img,status:'user'});
	              i++;
	           
	
	          });
	          callback(null,list_chat)

		 })
*/
	 }
	
	 ], function(err, result) {
    if (err) console.log('err');
    //console.log(list_chat);
	res.json({_id:'123123'});
    console.log('processed successfully using async lib11');
    //res.status(200).send('processed successfully using async lib');
  });
});
function check_ne(simple,val){
	check = true;
	if(simple.length != 0){
		//console.log(simple);
		simple.forEach(function(s){
			
			if(s+'' == val+''){
				
				check = false;
				
			}
		});
		
	}
	console.log(check)
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
