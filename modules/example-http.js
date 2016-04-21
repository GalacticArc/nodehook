exports.module = {
	name: "example-http-server",
	requires: ["httphandler"],
	libraries: ["http","request"], 
	failed: false
};

exports.module.preinit = function(){ // Do some pre-initialization, like connecting to db.
	if(global.modules["httphandler"] == undefined){
		return;
	}
};
var hserver = {
	name: "myhttpservername"
};

exports.module.init = function(){
  // get everything ready to run!
  var http = global.modules["httphandler"];
	http.hookport(80, hserver); //Hooks "myhttpservername" to port 80
	
	http.hookget("example", exampledir, false, hserver); // Handles any traffic to port 80 that goes into /example
  setInterval(customFunction, 5); // Example of a task you run with this module.
};

exports.module.close = function(){
	// Run code before closing. This will be called when the process needs to close via Ctrl + C for example.
};

function customFunction(){
  // Do some custom things.
}

// Handles path of /
function rootdir(page_data, request, response, json){
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end("Welcome to /, you are no in any sub-directories.");
}

// Handles path of /example
function exampledir(page_data, request, response, json){
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end("Welcome to /example, you can do other things using this function");
}
