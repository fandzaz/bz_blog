var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('chat');
});
router.post('/chatlist', function(req, res, next) {
	console.log(req.body.id);
	var session_id = req.body.id;
	

	var list_chat = [];
	db.find('Bzn_group',{member:db.ObjectId(session_id)},function(data){
		
			console.log(data);
/*
				data.forEach(function(item){
			
					if(session_id != item._id){
						list_chat.push(item);
						
					}			
		});
*/


		
		res.json({id:'sdfsdfds'});
		
	});

//res.json({id:'xxxx'});

});

module.exports = router;
