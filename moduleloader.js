/*
	ModuleLoader v0.1
		Loads modules from the modules directory.
*/
var fs = require("fs");
global.modules = {};
global.mod = function(){ return "yo"; };
global.server = {
	id: "default"
};

var skipmods = [];
	
var args = process.argv.slice(2);
for(var i in args){
	val = args[i];
	if(val.substring(0,3) == "id="){
		global.server.id = val.split("=")[1];	
	} else if(val.substring(0,5) == "skip="){
		var skip = val.split("=");
		var sl = skip[1].split(",");
		for(var z in sl){
			skipmods.push(sl[z]);
		}
	} else if(val.substring(0,5) == "port="){
		global.server.webport = val.split("=")[1];
	}
}

console.log("Server ID "+global.server.id+" starting.");

fs.readdir("./modules", function(err, items) {
    for (var i=0; i<items.length; i++) {
        // console.log(items[i]);
		var ext = items[i].substring(items[i].length - 3);
		if(ext == ".js"){
			var modname = "./modules/"+items[i];
			var m = require(modname);
			if(m.module == undefined || m.module.name == undefined){
				console.log(items[i] +" module does not have a name.");
			} else {
				// console.log("Loaded module "+m.module.name);
				if(skipmods.indexOf(m.module.name) == -1){
					global.modules[m.module.name] = m;
				} else {
					// console.log("Skipping "+modname);
					var name = require.resolve(modname);
					delete require.cache[modname];	
				}
			}
		}
    }
	
	for(var m in global.modules){
		var mod = global.modules[m].module;
		var re = "";
		var missing = false;
		for(var m in mod.libraries){
			try {
				require.resolve(mod.libraries[m])
			} catch(e) {
				console.error(mod.name+": Missing node library: "+ mod.libraries[m]);
				process.exit(e.code);
			}
		}

		for(var m in mod.requires){
			if(global.modules[mod.requires[m]] == undefined){
				missing = true;
				re = re + "\n - "+mod.requires[m];
			}
		}

		if(missing == true){
			console.log(mod.name+" is missing libraries:"+re);
			mod.failed = true;
		}
	}
	
	for(var m in global.modules){
		if(global.modules[m].module.preinit !== undefined){
			global.modules[m].module.preinit();
		}
	}
	
	for(var m in global.modules){
		if(global.modules[m].module.init !== undefined){
			global.modules[m].module.init();
		}
	}
	
	console.log("Server ID "+global.server.id+" done loading.");
	
	process.on('SIGINT', function() {
		for(var m in global.modules){
			if(global.modules[m].module.close !== undefined){
				global.modules[m].module.close();
			}
		}
	  	process.exit();
	});
});

// Uncomment if you wish to catch errors.
/*process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});*/
