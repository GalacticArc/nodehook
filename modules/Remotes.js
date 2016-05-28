/*
	Name: Remotes
	Description:
		Handles networking between server and clients.
	Last Update: May 28th
	Version: 0.1.1
*/
exports.module = {
	name: "remotes",
	requires: [],
	libraries: ["ws"],
	failed: false
};

var WebSocket = require('ws');
var WebSocketServer = require('ws').Server;
var time_now = function(){ return Math.floor(Date.now() / 1000); }
exports.module.preinit = function()
{
	
}

exports.module.init = function()
{

}

exports.Server = function(name, port)
{
	var server = {
		name: name,
		socket: null,
		Clients: {},
		ClientNum: 1,
		Events: {},
		Functions: {},
		port: port
	};

	server.CreateEvent = function(ename, callback){
		var newEvent = {};
		newEvent.Callback = callback;
		newEvent.Fire = function(client, data, flags)
		{
			var np = {
				a: ename,
				d: data
			}
			client.send(JSON.stringify(np));
		}

		newEvent.FireAllClients = function(data, flags)
		{
			for(var i in server.Clients){
				newEvent.Fire(server.Clients[i], data, flags);
			}
		}

		server.Events[ename] = newEvent;
	}

	server.OnServerReceive = function(client, data, flags)
	{
		console.log("Receive: "+data);
	}

	server.socket = CreateServerSocket(server);
	return server;
}

function CreateServerSocket(server)
{
	server.socket = new WebSocketServer({ port: server.port });
	server.socket.on('connection', function connection(clientSock) {
		server.ClientNum++;
		clientSock.on('message', function(msg, flags){
			server.OnServerReceive(clientSock, msg, flags);
		});
		//clientSock.on('ping', server.ping);
		clientSock.on('close', function(msg){

		});

		server.Clients[server.ClientNum] = clientSock;
	});

	server.socket.on('error', function(){
		console.log(err.stack);
	});
}

exports.Client = function(name, location, flags)
{
	var client = {
		name: name,
		socket: null,
		Events: {},
		Funtions: {},
		l: location,
		logging: false
	};


	client.OnEvent = function(name, callback)
	{
		client.Events[name] = callback;
	}

	client.OnClientReceive = function(data, flags)
	{
		try {
			if(flags.binary){
				// Handle binary
			} else {
				var j = JSON.parse(data)
				if(client.Events[j.a] != undefined){
					client.Events[j.a](j.d);
				}
			}
		} catch(err){
			if(client.logging){
				console.log(err.stack);
			}
		}
	}

	client.socket = CreateSocket(client);

	return client;
}

exports.reconnect = function(obj)
{
	obj.socket = CreateSocket(obj);
}

function CreateSocket(obj)
{
	if(obj.l == undefined){
		console.log("Can't open socket, location missing.");
		return;
	}
	var socket = new WebSocket(obj.l);
	socket.on('open', function open() {
		console.log(obj.name +" socket opened.");
		socket.ping(obj.name);
	});

	socket.on('message', function(data, flags) {
		obj.OnClientReceive(data, flags);
	});

	socket.on("error", function(err){
		if(socket.readyState == WebSocket.CLOSED || socket.readyState == WebSocket.CLOSING){
			setTimeout(function(){
				exports.reconnect(connections[obj.name])
			}, 5000);
			console.log("Socket has errored, reconnecting.");
		} else {
			console.log(err.stack);
		}
	
	});

	socket.on("close", function(err, msg){
		console.log(obj.name +" socket has closed.");
		setTimeout(function(){
			exports.reconnect(obj)
		}, 10000);
	});

	return socket;
}
