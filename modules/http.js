exports.module = {
	name: "httphandler",
	requires: [],
	libraries: ["http"],
	failed: false
};

var http = null;
var server = {};
var settings = {
	port: 0
};
var hooks = [];
function handleRequest(request, response, httpconfig){
	if(httpconfig == undefined){
		console.log("Missing httpconfig");
		return; 
	}
	console.log("Request on "+httpconfig.name);
    try {
		var s = request.url.split("/");
		var page_data = [];
		for(var i in s){
			if(s[i] !== undefined && s[i] !== ""){
				page_data.push(s[i]);
			}
		}
		var hfound = false;
		for(var i in hooks){
			var h = hooks[i];
			if((h.path == "/" && page_data[0] == undefined) || h.path == page_data[0]){
				hfound = true;
				if(request.method == "POST" && request.method == h.method){
					if(h.json){
						var dj = JSON.parse(request.body);
						h.callback(page_data, request, response, dj);	
					} else {
						h.callback(page_data, request, response);
					}
				} else if(request.method == "GET" && request.method == h.method) {
					h.callback(page_data, request, response);
				} else {
					response.writeHead(404, {'Content-Type': 'text/html'});
					response.end("The API you're looking for was not found. 2");	
					return;
				}
			}
		}
		if(hfound == false){
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.end("The API you're looking for was not found.");	
			return;	
		}
    } catch(err) {
       console.log(err);
    }
}

exports.connections = {};
exports.module.preinit = function(){
	http = require("http");
};

exports.module.init = function(){
	
};

exports.hookpost = function(rname, callback, json, httpconfig){
	if(json == undefined){ json = false; };
	var hook = {
		path: rname,
		json: json,
		method: "POST",
		callback: callback,
		name: httpconfig.name
	}
	
	hooks.push(hook);
};

exports.hookget = function(rname, callback, json, httpconfig){
	if(json == undefined){ json = false; };
	var hook = {
		path: rname,
		json: json,
		method: "GET",
		callback: callback,
		name: httpconfig.name
	}
	
	hooks.push(hook);
};

exports.hookport = function(iport, httpconfig){
	if(httpconfig == undefined || httpconfig.name == undefined){
		console.log("No httpconfig or name defined when setting up port "+iport);
		return;
	}
	if(iport == false){
		console.log("No port defined in parameters when setting up "+httpconfig.name);	
	} else {
		var sport = iport.toString();
		server[sport] = http.createServer(function(h,h2){
			handleRequest(h,h2,httpconfig);
		});
		console.log("Setting up port "+sport+" with name "+httpconfig.name);
		server[sport].listen(iport, function(){});
	}
};
