exports.module = {
	name: "example",
	requires: ["httphandler"], // This is modules that are a part of the application, like "example" is the name of the module.
	libraries: ["http","request"], // These are libraries that are installed via npm.
	failed: false // If the loading failed or not.
};

exports.module.preinit = function(){ // Do some pre-initialization, like connecting to db.
	if(global.modules["httphandler"] == undefined){
		return;
	}
};

exports.module.init = function(){
  // get everything ready to run!
  
  setInterval(customFunction, 5); // Example of a task you run with this module.
};

exports.module.close = function(){
	// Run code before closing. This will be called when the process needs to close via Ctrl + C for example.
};

function customFunction(){
  // Do some custom things.
}
