var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat1');
});


router.post('/chatshop',function(req,res,next){
	var session_id = req.body.id;
	user = [];
	async.waterfall([
	function(callback) {
      db.find('Bzn_shop',{user_id:db.ObjectId(session_id)},function(data){
	       callback(null,data);
	  });
	 
    },
      ], function(err, result) {
	    if (err) console.log('err');
	    //console.log(list_chat);
		res.json(result);
	    console.log('processed successfully using async lib11');
	    //res.status(200).send('processed successfully using async lib');
	  });


	
});
router.post('/chatlist', function(req, res, next) {
	console.log(req.body.id);
	var session_id = req.body.id;
	

  var group = [];
  var user = [];
	var list_chat = [];
  var friend = [];


  async.waterfall([
    function(callback) {
      db.find('Bzn_group',{member:db.ObjectId(session_id)},function(data){
	      data.forEach(function(item){
			  user.push(item.member[0]);
			  user.push(item.member[1]);
			  group.push(item._id);
      	});
      	var data = {u:user}
	    callback(null, data);
	  });
	  
    },
    function(data, callback) {
	//console.log(data.u);
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
	},
	function (data,callback){
		//var data1 = {u:data.u,list:list_chat}
		var friendlist = [];
		data.u.forEach(function(u){
			if(u != session_id){
				friendlist.push(u);
			}
				
		})
		//console.log(friendlist);
		//console.log(friend);
		db.find('Bzn_friend',{ $or: [ { user_id:db.ObjectId(session_id) }, { user_id_res:db.ObjectId(session_id)}],status:1},function(friend){
			friend.forEach(function(f){
				
				if(f.user_id == session_id){
					friendlist.push(f.user_id_res);
				}else{
					friendlist.push(f.user_id);
				}
				
			})
			
			//console.log(friendlist.getUnique());
			var data1 = {u:friendlist.getUnique(),list:list_chat}
			callback(null,data1);
			
		})
		
	},
	 function(data,callback){
		 list_chat = data.list;
		 console.log
		 db.find('Bzn_users',{ _id: { $in: data.u } },function(data_user){
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
	 }
	
	 ], function(err, result) {
    if (err) console.log('err');
    //console.log(list_chat);
	res.json(list_chat);
    console.log('processed successfully using async lib11');
    //res.status(200).send('processed successfully using async lib');
  });
});
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
