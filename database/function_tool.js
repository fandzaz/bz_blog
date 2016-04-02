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

	this.getTime = function(){
		var d = new Date();
		return Math.floor(d.getTime()/1000);
	}


}
