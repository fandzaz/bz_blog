module.exports = new function(){
	var MongoClient = require('mongodb').MongoClient;
	var dbmongo = '';
	var dbm = ''
	var ObjectID = require('mongodb').ObjectID;
	var url = 'mongodb://DevByDeeDev:Pbird7979!@27.254.81.103:27017/bz_test';
	//var url = 'mongodb://tanapong:qwertyui@ds053305.mlab.com:53305/mini_test';
	var mongoose = require('mongoose');
	mongoose.connect(url);
	var Schema = mongoose.Schema;
	var group = mongoose.Schema({
		group_name:String,
		group_type:String,
		member:[],
	  last_update:Number,
		shop_id:Schema.Types.Mixed,
		pictureGroup:Schema.Types.Mixed,
	},{ collection : 'Bzn_group'})

	var group_member = mongoose.Schema({
		user_id:Schema.Types.ObjectId,
		group_id:Schema.Types.ObjectId,
		join_date:Number,
		last_update:Number,
	},{collection:'Bzn_group_member'});
	var users = mongoose.Schema({},{ collection : 'Bzn_users'})
	var shop = mongoose.Schema({},{ collection : 'Bzn_shop'})
	var friend = mongoose.Schema({},{ collection : 'Bzn_friend'})
	var group_message = mongoose.Schema({
		group_id:Schema.Types.ObjectId,
		user_id:Schema.Types.ObjectId,
		content:Schema.Types.Mixed,
		post_time:Number,
		read_status:Number,
		post_type:String,
		ip:String,
		shop_id:Schema.Types.Mixed,
		attr:Schema.Types.Mixed
	},{ collection : 'Bzn_group_message'})
	var user_online = mongoose.Schema({},{ collection : 'Bzn_user_online'})
	mongoose.model('group_member', group_member);
	mongoose.model('group', group);
	mongoose.model('users', users);
	mongoose.model('shop', shop);
	mongoose.model('friend', friend);
	mongoose.model('group_message', group_message);
	mongoose.model('user_online', user_online);
	this.initMongo = function(){
		MongoClient.connect(url, function(err, db) {
		  if(err) {
			  console.log(err);
		  }
		  else{
			  dbm = db;
			  console.log('ok');
		  }
		});

	}
	this.ObjectId = function(id){
		return new ObjectID(id)
	}
}
