module.exports = new function(){
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
	this.inArray = function(value,arr){
		var check = false;
		arr.forEach(function(loop){
			if(loop+'' == value){
				check = true
			}
		});
		return check;
	}
	this.urlify = function(text) {
	  var urlRegex = /(https?:\/\/[^\s]+)/g;
	    return text.replace(urlRegex, function(url) {
	        return '<a href="' + url + '">' + url + '</a>';
	    })
	}

	this.getTime = function(){
		var d = new Date();
		return Math.floor(d.getTime()/1000);
	}
	this.getIpv4 = function(ip){
		if (ip.length < 15){
       ip = ip;
    }
    else{
       var nyIP = ip.slice(7);
       ip = nyIP;
    }
		return ip;
	}


}
