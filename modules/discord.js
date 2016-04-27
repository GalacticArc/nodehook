var fs = require("fs");
exports.module = {
	name: "discordbot",
	requires: [],
	libraries: ["discord.io"],
	failed: false
};

exports.bots = {};
exports.hooks = [];
exports.prefixes = {};
exports.msg = function(b,c,m){
	b.sendMessage({
		to: c,
		message: m
	});	
}
exports.mainbot = null;
function out(c,m){
	if(exports.mainbot == null || exports.bots[exports.mainbot] == undefined){
		console.log(m);	
	} else {
		exports.msg(exports.bots[exports.mainbot], c, m);
	}
}



// Handles new messages.
// Bot Name, Username, User ID, Channel ID, Message, Raw Event.
exports.handleMessage = function(b, un, u, c, m, r){
	var settings = require("../data/discord.json");
	for(var bot in exports.bots){
		if(exports.bots[bot].id === u || exports.bots[bot].username == un){
			return;
		}
	}
	if(m.substring(0,settings.settings.prefix.length) == settings.settings.prefix){
		var cmd = m.split(" ");
		var excmd = cmd[0].substring(settings.settings.prefix.length);
		if(excmd == "test"){
			if(exports.mainbot == null){
				out(c, "[Discord] No mainbot selected.");
			}
		} else if(excmd == "set"){
			if(cmd[1] == undefined){
				out(c, "[Discord] Please select a mainbot.");
			} else {
				if(exports.bots[cmd[1]] == undefined){
					out(c, "[Discord] Bot not found.");
				} else {
					exports.mainbot = cmd[1];
					settings.settings["mainbot"] = cmd[1];
					fs.writeFileSync("./data/discord.json", JSON.stringify(settings));
					out(c, "[Discord] Main bot set.");
				}
			}
		} else if(excmd == "mainbot"){
			out(c, "[Discord] The main bot is: "+String(exports.mainbot));
		} else if(excmd == "hooks"){
			var hooks = "```Current hooks:";
			for(var h in exports.hooks){
				hooks=hooks+"\n"+exports.hooks[h].command;
			}
			hooks=hooks+"```";
			out(c, hooks);
		}
	} else {
		for(var i in exports.prefixes){
			if(exports.prefixes[i].discord.use == b){
				var p = m.substring(0, i.length);
				if(p == i){
					var cmds = m.split(" ");
					var excmd = cmds[0].substring(i.length);
					for(var h in exports.hooks){
						if(exports.prefixes[i].discord == exports.hooks[h].discord && exports.hooks[h].command == excmd){
							exports.hooks[h].callback(cmds, u, c, m, r, exports.hooks[h].command);
						}
					}
				}
			}
		}
	}
};

// Checks if the given m (message) has the p (prefix)
exports.checkPrefix = function(m,p){
	
};

exports.module.preinit = function(){

};

// Hooks the specific discordhook to handle the prefix.
exports.hookprefix = function(discordhook, prefix){
	exports.prefixes[prefix] = {
		discord: discordhook
	}
};

// Hooks the command to the specific discordhook, requires the prefix to be called.
exports.hookcommand = function(discordhook, command, callback){
	exports.hooks.push({
		discord: discordhook,
		command: command,
		callback: callback
	});
};

exports.channelmessage = function(discordhook, c, m){
	if(discordhook == undefined){
		return;	
	}
	
	if(exports.bots[discordhook.use] == undefined){
		console.log("Attempt to channelmessage, no bot found.");
		return;	
	} else {
		exports.bots[discordhook.use].sendMessage({
			to: c,
			message: m
		});	
	}
};

exports.initiatebot = function(name, settings){
	var DiscordClient = require('discord.io');
	exports.bots[name] = new DiscordClient(settings);

	exports.bots[name].on("error", function(error) { 
		console.log("[Discord] "+name+", Error thrown, attempting to reconnect.");
		setTimeout(function(){
			exports.initiatebot(name, settings);
		}, 5000);
	});	
	
	exports.bots[name].on('disconnected', function() {
		console.log("[Discord] "+name+", Disconnect thrown, attempting to reconnect.");
		setTimeout(function(){
			exports.initiatebot(name, settings);
		}, 5000);
	});
	
	exports.bots[name].on("ready", function(rawEvent) {
		// console.log("[Discord] "+name+", now online.");
	});
	
	exports.bots[name].on("err", function(error) { 
		console.log("[Discord] "+name+", Error thrown, attempting to reconnect.");
		setTimeout(function(){
			exports.initiatebot(name, settings);
		}, 5000);
	});
	
	exports.bots[name].on('message', function(un, u, c, m, r){
		exports.handleMessage(name, un, u, c, m, r);
	});
};

exports.module.init = function(){
	global.discord = exports;
	// Initaite all the bots.
	var settings = require("../data/discord.json");
	exports.mainbot = settings.settings["mainbot"];
	for(var b in settings.bots){
		if(settings.bots[b].login != undefined){
			exports.initiatebot(b, settings.bots[b].login);
		}
	}
};

exports.module.close = function(){
	for(var i in exports.bots){
		exports.bots[i].disconnect();	
	}
	console.log("\nClosing discord.");	
};
