/*
 Module Name: httphandler
  Description: It makes it a bit quicker to hook into certain URLs, currently does not support query strings.
*/
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
var hooks = {};
function handleRequest(request, response){
    try {
		if(request.url == "/"){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end("The server ID is "+global.server.id);		
			return;
		}
		var s = request.url.split("/");
		var page_data = [];
		for(var i in s){
			if(s[i] !== undefined && s[i] !== ""){
				page_data.push(s[i]);
			}
		}
		if(hooks[page_data[0]] != undefined){
			var h = hooks[page_data[0]];
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
				response.end("The API you're looking for was not found.");	
				return;
			}
		} else {
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.end("The API you're looking for was not found.");	
			return;
		}
		
        //dis.dispatch(request, response);
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

exports.hookpost = function(rname, callback, json){
	if(json == undefined){ json = false; };
	var hook = {
		json: json,
		method: "POST",
		callback: callback
	}
	
	hooks[rname] = hook;
};

exports.hookget = function(rname, callback, json){
	if(json == undefined){ json = false; };
	var hook = {
		json: json,
		method: "GET",
		callback: callback
	}
	
	hooks[rname] = hook;
};

exports.hookport = function(iport, callback){
	var sport = iport.toString();
	server[sport] = http.createServer(handleRequest);
	console.log("Setting up port "+sport);
	server[sport].listen(iport, function(){});
};
