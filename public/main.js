//Vue Code
const ChatMessage = {
    props:['message'],
    template:`
        <li>
            <div class="message">
                <div class="header">
                    <span class="sender">{{ message.sender }}</span>
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
        'messages': [
            { sender: 'amisa', content: 'Wey klk'},
            { sender: 'luis', content: 'dime a ver mi hermano'},
        ]
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
        nickname = prompt("What is your nickname?");
        Cookies.set('nickname', nickname);
    }
    socket.emit('join', nickname);
});

socket.on('messages', function(sender, content){
    console.log(sender);
    console.log(content);
    container.messages.push({sender: sender, content: content});
});