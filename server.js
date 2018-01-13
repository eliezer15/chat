const express = require('express');
const app = express();
const config = require('./config');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let online_users = [];
const messages = [];

const storeMessages = function(user, content) {
    messages.push({user: user, content: content});
    if (messages.length > 10) {
        messages.shift();
    }
}

const color_aray = {
    next_index: 0,
    array: ['red', 'blue', 'green', 'purple', 'magenta', 'darkred', 'dodgerblue', 'orange'],
    next: function() {
        let toReturn = this.array[this.next_index];
        this.next_index = ((this.next_index + 1) % this.array.length);
        
        return toReturn;
    }
}

io.on('connection', function(client) {

    client.on('join', function(user, from_cookie) {
        if (from_cookie && online_users.find((u) => u.nickname === user.nickname)) {
            client.emit('duplicate');
        }
        else {
            let index = 1;
            const original_nickname = user.nickname;
            while (online_users.find((u) => u.nickname === user.nickname)) {
                user.nickname = original_nickname + (++index);
            }

            user.color = from_cookie? user.color: color_aray.next();
            client.user = user;

            client.emit('save', user);

            online_users.push(client.user);

            client.broadcast.emit('join', online_users);
            client.emit('join', online_users);
            
            messages.forEach(function(message) {
                client.emit('messages', message.user, message.content);
            });
        }
    });

    client.on('typing', function() {
        client.broadcast.emit('typing', client.user);
    });

    client.on('messages', function(content) {
        client.broadcast.emit('messages', client.user, content);
        client.emit('messages', client.user, content);
        storeMessages(client.user, content);
    });

    client.on('disconnect', function() {
        if (client.user) {
            online_users = online_users.filter((user) => user.nickname !== client.user.nickname);
            client.broadcast.emit('logout', online_users);
        }
    });

});
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(config.Port);
console.log('Listening on port ' + config.Port);