module.exports = new function(){
	var Users = require('mongoose').model('users');
	var Group = require('mongoose').model('group');
	var Shop = require('mongoose').model('shop');
	var Friend = require('mongoose').model('friend');
	this.getUser = function(data_array,callback){
		Users.find({ _id: { $in: data_array } }).lean().exec(function(err,u){
			data_user_tool = [];
				u.forEach(function(un){
					if(un.avatar != null){
						img = un.avatar
			    }else{
				    img = 'assets/images/blank_user.png'
					}
					data_user_tool.push({_id:un._id,name:un.first_name+' '+un.last_name,gender:un.gender,email:un.email,facebook_id:un.facebook_id,join_date:un.join_date,activated:un.activated,latitude:un.latitude,longitude:un.latitude,picture:img});
				});
				callback(data_user_tool);
		});
	}
	this.getUserByName = function(name,callback){
		var patt = new RegExp('/^j/','i');

		Users.where('first_name').regex(patt).lean().exec(function(err,result){
		//	new RegExp('/^j/i')
			callback(result);
		});
	}
	this.getUersOne = function(user_id,callback){
		var dataUserOne = [];
		Users.findOne({_id:db.ObjectId(user_id)}).lean().exec(function(err,u){
			if(u.avatar != null){
				img = u.avatar
			}else{
				img = 'assets/images/blank_user.png'
			}
			dataUserOne = {_id:u._id,name:u.first_name+' '+u.last_name,gender:u.gender,email:u.email,facebook_id:u.facebook_id,join_date:u.join_date,activated:u.activated,latitude:u.latitude,longitude:u.latitude,picture:img};
			callback(dataUserOne);
		});
	}
	// this.getShopByUser = function(data_array,callback){
	// 	var shopList_gsbu = [];
	// 	Shop.find({user_id:{$in:data_array}}).lean().exec(function(err,result){
	// 		result.forEach(function(row){
	// 			shopList_gsbu.push({_id:row._id,user_id:row.user_id,name:row.shop_name,shop_cover:row.shop_cover,shop_slug:row.shop_slug,shop_detail:row.shop_detail,shop_logo:row:shop_logo})
	// 		});
	// 	})
	// }
	this.findGroupGetWhere = function(session_id,typegroup,where,callback){
		Group.find({member:db.ObjectId(session_id),group_type:typegroup}).lean().exec(function(err,group){
			var memberGroup = [];
			var date_fggw = [];
			var gid_fggw = [];
			if(group.length != 0){
        group.forEach(function(ck){
          if(ck.member[0] == session_id){
            memberGroup.push(ck.member[1]);
            date_fggw[ck.member[1]] = ck.last_update;
            gid_fggw[ck.member[1]] = ck._id;
          }else{
            memberGroup.push(ck.member[0]);
            date_fggw[ck.member[0]]= ck.last_update;
            gid_fggw[ck.member[0]] = ck._id;
          }

        });
				if(where == 'shop'){
					Shop.find({_id:{$in:memberGroup},shop_status:1}).lean().exec(function(err,resultShop){
						var shop_fggw = [];
						resultShop.forEach(function(row_shop){
							shop_fggw.push({_id:row_shop._id,name:row_shop.shop_name,picture:row_shop.shop_logo});
						});

						callback({data:shop_fggw,group:gid_fggw,last_update:date_fggw});
					});
				}else{
					module.exports.getUserChat(session_id,memberGroup,function(resultUser){
						usersList_fggw = [];
						resultUser.forEach(function(user_list){
							usersList_fggw.push({gid:gid[user_list._id],_id:user_list._id,name:user_list.name,picture:user_list.picture,status:user_list.status,date:date[user_list._id],status_friend:user_list.status_friend});
						});
						callback({data:usersList_fggw,group:gid_fggw,last_update:date_fggw});
						//callback(usersList_fggw);
					});
				}

			}else{
				callback('');
			}
		});
	}
	this.getUserAndShop = function(array_data,callback){
		module.exports.getUser(array_data,function(resultUser){


		//Users.find({_id:{$in:array_data}}).lean().exec(function(err,resultUser){
			var user_guas = [];
			resultUser.forEach(function(row_user){
				user_guas.push({_id:row_user._id,name:row_user.name,picture:row_user.picture});
			});
			Shop.find({_id:{$in:array_data},shop_status:1}).lean().exec(function(err,resultShop){
				var shop_guas = [];
				resultShop.forEach(function(row_shop){
					shop_guas.push({_id:row_shop._id,name:row_shop.shop_name,picture:row_shop.shop_logo});
				});
				var callback_guas = user_guas.concat(shop_guas);
				callback(callback_guas);
			});
		});
	}
	// this.getUserByShop = function(array_userid,callback){
	// 	Shop.find({user_id:{$in:array_userid}}).lean().exec(function(err,result){
	//
	// 	});
	// }
	this.checkFriend = function(user_id,data_array,callback){//data_array เพื่อนที่ต้องการเช็ค
		Friend.find({$or: [ { user_id:db.ObjectId(user_id) }, { user_id_res:db.ObjectId(user_id)}],status:1}).lean().exec(function(err,result){
			var ckFriend = [];
			result.forEach(function(f){
				if(user_id == f.user_id){
					ckFriend.push(f.user_id_res);
				}else{
					ckFriend.push(f.user_id);
				}
			});

			var status_friend = [];
			ckFriend.forEach(function(f){
				status_friend[f] = f;
			});
			var ckGFriend = [];
			data_array.forEach(function(arr){
				module.exports.check_ne
				if(module.exports.check_ne(status_friend,arr)){
					ckGFriend[arr] = true;
				}else{
					ckGFriend[arr] = false;
				}
				// if(arr+'' == status_friend[arr]+''){
				// 	ckGFriend[arr] = true;
				// }else{
				// 	ckGFriend[arr] = false;
				// }
			});
			callback(ckGFriend);
		});
	}
	this.getUserChat = function(session_id,data_array,callback){ //session_id ส่งมาเพิ่อเช็คเพื่อน

		module.exports.checkFriend(session_id,data_array,function(friend){

			Users.find({ _id: { $in: data_array } }).lean().exec(function(err,u){
				dataChat = [];
				u.forEach(function(un){
						if(un.avatar != null){
							img = un.avatar
				    }else{
					        img = 'assets/images/blank_user.png'
						}

						dataChat.push({_id:un._id,name:un.first_name+' '+un.last_name,gender:un.gender,email:un.email,facebook_id:un.facebook_id,join_date:un.join_date,activated:un.activated,latitude:un.latitude,longitude:un.latitude,picture:img,status_friend:friend[un._id]});
					});

					callback(dataChat);
				});
		});


	}
	// this.getFriendFindName = function(user_id,find){
	//
	// }

	this.getFriend = function(session_id,array_check1,callback){

		Friend.find({$or: [ { user_id:db.ObjectId(session_id) }, { user_id_res:db.ObjectId(session_id)}],status:1}).lean().exec(function(err,friend){
			var friendlist = [];

			if(friend.length != 0){
				friend.forEach(function(f){//start loop
				 if(f.user_id == session_id){

					 if(module.exports.check_ne(array_check1,f.user_id_res)){
						 friendlist.push(f.user_id_res);
					 }
				 }else{
					if(module.exports.check_ne(array_check1,f.user_id)){
						 friendlist.push(f.user_id);
					 }
				 }
				});//end loop
			}

			module.exports.getUser(friendlist,function(user){
				callback(user);
			});
		});
	}

	this.check_ne = function(simple,val){
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
	this.htmlspecialchars_decode = function(string, quote_style) {
  	var optTemp = 0,
			    i = 0,
			    noquotes = false;
			  if (typeof quote_style === 'undefined') {
			    quote_style = 2;
			  }
			  string = string.toString()
			    .replace(/&lt;/g, '<')
			    .replace(/&gt;/g, '>');
			  var OPTS = {
			    'ENT_NOQUOTES': 0,
			    'ENT_HTML_QUOTE_SINGLE': 1,
			    'ENT_HTML_QUOTE_DOUBLE': 2,
			    'ENT_COMPAT': 2,
			    'ENT_QUOTES': 3,
			    'ENT_IGNORE': 4
			  };
			  if (quote_style === 0) {
			    noquotes = true;
			  }
			  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
			    quote_style = [].concat(quote_style);
			    for (i = 0; i < quote_style.length; i++) {
			      // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
			      if (OPTS[quote_style[i]] === 0) {
			        noquotes = true;
			      } else if (OPTS[quote_style[i]]) {
			        optTemp = optTemp | OPTS[quote_style[i]];
			      }
			    }
			    quote_style = optTemp;
			  }
			  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
			    string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
			    // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
			  }
			  if (!noquotes) {
			    string = string.replace(/&quot;/g, '"');
			  }
			  // Put this in last place to avoid escape being double-decoded
			  string = string.replace(/&amp;/g, '&');

			  return string;
			}
}
