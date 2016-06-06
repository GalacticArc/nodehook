var fs = require("fs");
exports.module = {
	name: "discordbot",
	requires: [],
	libraries: ["discord.js"],
	failed: false
};
var dsettings = require("../data/discord.json"); 
var sql = null;
var Discord = require("discord.js");
exports.bots = {};
exports.hooks = [];
exports.prefixes = [];
exports.msg = function(b,c,m){
	var bot = exports.bots[b];
	var s=dsettings.bots[b].library;
	if(s == "discord.io"){
		bot.sendMessage({
			to: c,
			message: m
		});	
	} else if(s == "discord.js"){
		bot.sendMessage(c,m);
	}
}
exports.mainbot = null;
function out(c,m){
	if(exports.mainbot == null || exports.bots[exports.mainbot] == undefined){
		console.log(m);	
	} else {
		exports.msg(exports.mainbot, c, m);
	}
}

// Handles new messages.
// Bot Name, Username, User ID, Channel ID, Message, Raw Event.
exports.handleMessage = function(b, m){

	try {
		if(m.author.bot === false){
			for(var i in exports.prefixes){
				if(exports.prefixes[i].discord.use == b){
					var p = m.content.substring(0, exports.prefixes[i].prefix.length);
					if(p === exports.prefixes[i].prefix){
						var cmds = m.content.substring(p.length).split(" ");
						var excmd = cmds[0];
						for(var h in exports.hooks){
							if(exports.prefixes[i].discord.name == exports.hooks[h].discord.name && exports.hooks[h].command == excmd){
								if(exports.prefixes[i].discord.check != undefined){
									if(exports.prefixes[i].discord.check(m, excmd) == true){
										exports.hooks[h].callback(m, exports.hooks[h].command);
										return;
									}
								} else {
									exports.hooks[h].callback(m, exports.hooks[h].command);
									return;
								}
							}
						}
					}
				}
			}
		}
		sql.logchat(m, function(success){
			if(!success){
				console.log("Error with SQL");	
			}
		}, 0);	
	} catch(err){
		console.log(err.stack);
		sql.logchat(m, function(success){
			if(!success){
				console.log("Error with SQL");	
			}
		}, 1);		
	}
};

// Checks if the given m (message) has the p (prefix)
exports.checkPrefix = function(m,p){
	
};

exports.module.preinit = function(){
	sql = global.modules["sqldb"];
	
	global.discord = exports;
	// Initaite all the bots.
	var settings = require("../data/discord.json");
	exports.mainbot = settings.settings["mainbot"];
	for(var b in settings.bots){
		if(settings.bots[b].token != undefined){
			exports.initiatebot(b, settings.bots[b]);
		}
	}
};

// Hooks the specific discordhook to handle the prefix.
exports.hookprefix = function(discordhook, prefix){
	exports.prefixes.push({
		prefix: prefix,
		discord: discordhook
	})
};

// Hooks the command to the specific discordhook, requires the prefix to be called.
exports.hookcommand = function(discordhook, command, callback){
	exports.hooks.push({
		discord: discordhook,
		command: command,
		callback: callback
	});
};

exports.initiatebot = function(name, settings){
	var ready = false;
	console.log("Created bot "+Object.keys(exports.bots).length);
	exports.bots[name] = new Discord.Client();
	exports.bots[name].on("message", function(m) {
		if(!ready){ return; }
		if(dsettings.settings.admins.indexOf(m.author.id) > -1){
			console.log(m.channel.server.name +" > "+m.author.username+" > "+m.cleanContent);
		}
		exports.handleMessage(name, m);
	});
	exports.bots[name].on("ready", function(){
		console.log("Bot is now ready");
		setTimeout(function(){
			ready = true;
		}, 1000);
	});
	
	exports.bots[name].on("error", function(err) {
		console.log("Error with Discord.js");
		console.log(err.stack);
	});
	exports.bots[name].on("disconnected", function(){
		console.log("Disconnected");
	});

	setTimeout(function(){
		exports.bots[name].loginWithToken(settings.token);
	}, 500);
};

exports.module.init = function(){

};

exports.module.close = function(){
	for(var i in exports.bots){
		exports.bots[i].logout();	
	}
	console.log("\nClosing discord.");	
};
		
// The event, the type. 0 = discord.js, 1 = discord.io
function convertEvent(msgevent, type){
	if(type == 0){ return msgevent; }
	else { return null; }
}
