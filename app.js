const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

var messages = [];
var storeMessages = function(sender, content) {
    messages.push({sender: sender, content: content});
    if (messages.length > 10) {
        messages.shift();
    }
}
io.on('connection', function(client) {
    
    client.on('messages', function(content) {
        client.broadcast.emit('messages', client.nickname, content);
        client.emit('messages', client.nickname, content);
        storeMessages(client.nickname, content);
    });

    client.on('join', function(name) {
        client.nickname = name;

        client.broadcast.emit('join', client.nickname);
        client.emit('join', client.nickname);
        
        messages.forEach(function(message) {
            client.emit('messages', message.sender, message.content);
        });
    });

});
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(8080);