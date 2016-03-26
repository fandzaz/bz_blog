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
