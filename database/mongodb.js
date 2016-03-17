module.exports = new function(){
	var MongoClient = require('mongodb').MongoClient;
	var mongoose = require('mongoose');
	var dbmongo = '';
	var dbm = ''
	var ObjectID = require('mongodb').ObjectID;
	var url = 'mongodb://DevByDeeDev:Pbird7979!@27.254.81.103:27017/bz_test';
	//var url = 'mongodb://tanapong:qwertyui@ds053305.mlab.com:53305/mini_test';
	mongoose.connect(url);
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
		//console.log(dbm);
		var fullname ;
		//this.find2('Bzn_users',{_id:db.ObjectId(id)});


				this.find('Bzn_users',{_id:db.ObjectId(id)},function(data){

					if(data == 'err'){
						console.log('err');
					}else{
						callback(data[0].first_name+' '+data[0].last_name);
					}


				});
/*
				function callback(data){
					fullname = data
				}
*/

/*
			function test(){

			}
*/
			//setTimeout(test, 3000);
			//console.log(fullname);



	}

	this.findMongo = function(name,callback){
		MongoClient.connect(url, function(err, db) {
		  if(err) {
			  console.log(err);
		  }
		  else{

			 // var doucument = {first_name:'Minnie'}
			  db.collection(name).find({}).toArray(function(err,collection){
				  //console.log(collection);
				  callback(collection);
			  });


			 }

		});
	}
	this.find = function(name,document,callback){
		var in_where = [];

		var insert = '';
		  dbm.collection(name).find(document).toArray(function(err,collection){
				if(collection.length != 0){
					callback(collection);
				}
			});
		}

	this.findMongo_whereid = function(name,doc,callback){
		MongoClient.connect(url, function(err, db) {
		  if(err) {
			  console.log(err);
		  }
		  else{

			 // var doucument = {first_name:'Minnie'}
			  db.collection(name).find(doc).toArray(function(err,collection){
				  //console.log(collection);
				  callback(collection);
			  });


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
