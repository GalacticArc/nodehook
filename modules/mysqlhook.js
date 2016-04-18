/*
 Module name: mysqlhook
 Description: For setting up mysql connections in a quick and easy manner. Handles disconnects automatically, and has disconnect events.
*/
exports.module = {
	name: "mysqlhook",
	requires: [],
	libraries: ["mysql"],
	failed: false
};

exports.connections = {};

exports.module.preinit = function(){
	exports.mysql = require("mysql");	
};

exports.module.init = function(){
	
};

var disconnectevents = [];

exports.ondisconnect = function(dbname, callback){
	disconnectevents.push({name: dbname, callback: callback});
};

exports.create = function(dbname, details){
	exports.connections[dbname] = exports.mysql.createConnection(details); 
	for(var i in disconnectevents){
		if(disconnectevents[i].name == dbname){
			disconnectevents[i].callback();
		}
	}
	exports.connections[dbname].connect(function(err) {
		if(err) { 
		  console.log('Unable to connect to DB', err);
		  setTimeout(function(){
			exports.create(dbname, details);  
		  }, 5000);
		} else {
			//console.log("[SQL] "+dbname+", Database connection successful.");	
		}
	}); 

	exports.connections[dbname].on('error', function(err) {
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			setTimeout(function(){
				exports.create(dbname, details);  
			}, 5000);
		} else {
			console.log('db error', err);
			throw err;
		}
	});
};
