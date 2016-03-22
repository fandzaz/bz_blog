module.exports = new function(){
	var Users = require('mongoose').model('users');
	this.getUser = function(data_array,callback){
		data_user_tool = [];
		Users.find({ _id: { $in: data_array } }).lean().exec(function(err,u){
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
}