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
	var group = mongoose.Schema({},{ collection : 'Bzn_group'})
	var users = mongoose.Schema({},{ collection : 'Bzn_users'})
	var shop = mongoose.Schema({},{ collection : 'Bzn_shop'})
	var friend = mongoose.Schema({},{ collection : 'Bzn_friend'})
	var group_message = mongoose.Schema({},{ collection : 'Bzn_group_message'})
	var user_online = mongoose.Schema({},{ collection : 'Bzn_user_online'})			
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
	this.getFullname = function(id,callback){
		var fullname ;
		this.find('Bzn_users',{_id:db.ObjectId(id)},function(data){
			if(data == 'err'){
				console.log('err');
			}else{
				callback(data[0].first_name+' '+data[0].last_name);
			}
		});
	}
	this.ObjectId = function(id){
		return new ObjectID(id)
	}
	this.removeAll = function(name,callback){
		MongoClient.connect(url, function(err, db) {
		  if(err) {
			  callback(err);
		  }
		  else{
			db.collection(name).deleteMany( {}, function(err, results) {
			 	console.log(results);
			 	callback();
		  	});
		  }

		});
	}
	this.remove_one = function(name,doc,callback){
		MongoClient.connect(url, function(err, db) {
		  if(err) {
			  callback(err);
		  }
		  else{
			db.collection(name).deleteOne(doc, function(err, results) {
				if(err){
					callback(err);
				}else{
					callback(results);
				}
			 	//console.log(results);

		  	});
		  }

		});
	}
	this.insert = function(name,data,callback){
		MongoClient.connect(url, function(err, db) {
		  if(err) {
			  callback(err);
		  }
		  else{
			db.collection(name).insert(data,function(err,success){
				  if(err){
					  callback(err);
				  }else{
					  callback(success);
				  }
			  })

			 }

		});


	}
}
