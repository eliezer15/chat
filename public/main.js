//Vue Code
const ChatMessage = {
    props:['message'],
    template:`
        <li>
            <div class="message">
                <div class="header">
                    <span class="nickname" v-bind:style="{color: message.sender.color}">
                        {{ message.sender.nickname }}
                    </span>
                </div>
                <span class="content">{{ message.content }}</span>
            </div>
        </li>
    `
}

const container = new Vue({
    el: '#container',
    components: {
        chatmessage: ChatMessage
    },
    data: {
        'chat_input': '',
        'room_name': 'El Club De Los Tigritos',
        'messages': [],
        'online_users':[]
    },
    methods: {
        sendMessage: function(e) {
            socket.emit('messages', this.chat_input);
            this.chat_input = '';
        }
    }
});

//Global IO Code
var socket = io.connect('http://localhost:8080');

socket.on('connect', function(data) {
    let nickname = '';
    if (Cookies.get('nickname')) {
        nickname = Cookies.get('nickname');
    }
    else {
        while (nickname === '' || nickname.length > 15) {
            nickname = prompt("What is your nickname? (Shorter than 15 letters)");
        }
        Cookies.set('nickname', nickname);
    }
    socket.emit('join', nickname);
});

socket.on('join', function(nickname) {
    let color = color_aray.next();
    container.online_users.push({nickname: nickname, color: color});
});

socket.on('messages', function(sender, content){
    var user = container.online_users.find(function(u) { return u.nickname === sender});
    container.messages.push({sender: user, content: content});
});

//Round Robin array implementation
var color_aray = {
    next_index: 0,
    array: ['red', 'blue', 'green', 'purple', 'magenta', 'aqua', 'orange'],
    next: function() {
        var toReturn = this.array[this.next_index];
        this.next_index = ((this.next_index + 1) % this.array.length);
        
        return toReturn;
    }
}