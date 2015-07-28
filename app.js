'use strict';

var express = require('express');
var app = express();

/**
 *  Allows third party clients to connect to the socket server
 */
app.use(function(request, response, next) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var subSocket = require('./lib/socket');
var badges = require('./models/badges');

/**
 *  Have our server listen on port 3000
 */
var port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log('Server listening on port %d', port);
});

/**
 *  Server static assets out of the `public` directory
 */
var path = require('path'); 
app.use(express.static(path.join(__dirname, 'public')));  //Using relative path as Express on Windows systems cannot 
                                                          //find 'public' folder otherwise

/**
 *  Send the `public/index.html` to the browser
 */
app.get('/', function(req, res){
  var path = require('path');
	res.sendFile('index.html', { root: path.join(__dirname, './public') }); //Using relative path as Express on Windows systems cannot 
                                                                          //find 'public' folder otherwise
});

/**
 *  Watch for connections
 */
io.sockets.on('connection', function(socket){
  badges.get(function(err, badgeList){
    badgeList.forEach(function(badge){
      socket.emit('badge', badge);
    });
  });
});

/**
 *  When a message comes in from the pub/sub system, send it to the sockets
 */
subSocket.on('message', function(channel, message){
  io.sockets.emit('badge', JSON.parse(message));
});
