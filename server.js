var net = require('net'); // tcp-server
var http = require("http"); // http-server
var qs = require('querystring'); // http-post
var argv = require('optimist').argv; // options parser
// var winston = require('winston'); // logger  (or log.js)

// Ask Chris
// TODO: Recieve json properly as http:post
// TODO: Figure out socket hash - can I do socket2id? or can I get the associated id on socket end?
// TODO: Heartbeat

// Map of sockets to devices
var id2socket = new Object;
var socket2id = new Object;

// Setup a tcp server
var server_plug = net.createServer(function(socket) {
	
	// Event handlers
  	socket.addListener("connect", function(conn) {
		console.log("Connection from " + socket.remoteAddress + ":" + socket.remotePort );	
	});
	
	socket.addListener("data", function(data) {
		console.log("received data: " + data);
		try {
			request = JSON.parse(data);
			
			response = request;
			if(request.m !== undefined && request['id'] !== undefined){ // hack on 'id', id is js obj property
				console.log("id: "+request['id']);
				console.log("m: "+request.m);
				if(request.m == 'connect'){
					console.log("associating uid " + request['id'] + " with socket " + socket);
					id2socket[request['id']] = socket;
					socket2id[socket] = request['id'];
					response.success = 'true';
				} else {
					response.success = 'true';
				}
			}
			socket.write(JSON.stringify(response));
		} catch (SyntaxError) {
			console.log('Invalid JSON:' + data);
			socket.write('{"success":"false","response":"invalid JSON"}');
		}
	});

	socket.on('end', function() {
		id = socket2id[socket]
		console.log("socket disconnect by id " + id);
		
		// wipe out the stored info
		console.log("removing from map socket:"+socket+" id:"+id);
		delete id2socket[id];
		delete socket2id[socket];
	});
	
	socket.on('timeout', function() {
		console.log('socket timeout');
	});

});

// Setup http server
var server_http = http.createServer(
	// Function to handle http:post requests, need two parts to it
	// http://jnjnjn.com/113/node-js-for-noobs-grabbing-post-content/
	function onRequest(request, response) {
		request.setEncoding("utf8");
		
		request.addListener("data", function(chunk) {
			request.content += chunk;
		});

		request.addListener("end", function() {
			console.log("post received!");
			//console.log("Request received: "+request.content);
			
			
			if (request.method == 'POST') {
				//var json = qs.parse(request.content);
				//console.log("Post: "+json);
				
				// HACK TO TEST STUFF:
				// send a message to one of the open sockets
				try {
					var socket = id2socket['123'];
					socket.write('{"m":"post"}');
				} catch (Error) {
					console.log("Cannot find socket with id "+'123');
				}
			}
			
			/*
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write("Thanks for sending a message");
			response.end();
			
			// TODO: log the individual json parameters
			try {
				json = JSON.parse(request.content);
			
				if(json.m !== undefined && json['id'] !== undefined){ // hack on 'id', id is js obj property
					console.log("id: "+json['id']);
					console.log("m: "+json.m);
				}
			} catch (Error) {
				console.log('Invalid JSON:' + request.content);
			}
			// TODO: forward this parameter to the correct socket connection
			*/
		});
	}
);


// Fire up the servers
var HOST = '127.0.0.1';
var PORT = 5280;
var PORT2 = 9002;

server_plug.listen(PORT, HOST);
console.log("TCP server listening on "+HOST+":"+PORT);

server_http.listen(PORT2);
console.log("HTTP server listening on "+HOST+":"+PORT2);