const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

var messages = [];
var storeMessages = function(name, data) {
    messages.push({name: name, data: data});
    if (messages.length > 10) {
        messages.shift();
    }
}
io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('messages', function(data) {
        client.broadcast.emit('messages', data);
        client.emit('messages', data);
        storeMessages(client.nickname, data);
    });

    client.on('join', function(name) {
        client.nickname = name;
        messages.forEach(function(message) {
            client.emit('messages', message.name + ': ' + message.data);
        });
    });

});
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(8080);