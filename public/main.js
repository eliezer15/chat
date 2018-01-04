//Vue Code
const ChatMessage = {
    props:['message'],
    template:`
        <li>
            <div class="message">
                <div class="header">
                    <span class="nickname" v-bind:style="{color: message.user.color}">
                        {{ message.user.nickname }}
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
    let user = {};
    let from_cookie = false;

    if (Cookies.get('user')) {
        user = JSON.parse(Cookies.get('user'));
        from_cookie = true;
    }
    else {
        while (nickname === '' || nickname.length > 15) {
            nickname = prompt("What is your nickname? (Shorter than 15 letters)");
        }
        user = {nickname: nickname};
    }
    socket.emit('join', user, from_cookie);
});

socket.on('save', function(user) {
    Cookies.set('user', JSON.stringify(user));
});

socket.on('join', function(online_users) {
    container.online_users = online_users;
    console.log(container.online_users);
});

socket.on('messages', function(user, content){
    container.messages.push({user: user, content: content});
});

socket.on('logout', function(online_users) {
    container.online_users = online_users;
});

socket.on('duplicate', function() {
    alert('You are already logged in to chat. Please use the other open tab');
    socket.disconnect(true);
})
