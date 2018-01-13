//Vue Container
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

//Vue Instance
const container = new Vue({
    el: '#container',
    components: {
        chatmessage: ChatMessage
    },
    data: {
        'nickname_input':'',
        'chat_input': '',
        'room_name': 'El Club De Los Tigritos',
        'messages': [],
        'online_users':[],
        'user_typing_message': '',
        'users_typing':[],
        'is_loggedin': false
    },
    watch: {
        chat_input: function(new_input) {
            socket.emit('typing');
        }
    },
    methods: {
        send_message: function(e) {
            if (this.chat_input !== '') {
                socket.emit('messages', this.chat_input);
                this.chat_input = '';
            }
        },
        login: function(e) {
            if (this.nickname_input !== '') {
                let user = {nickname: this.nickname_input};
                socket.emit('join', user, false);
                this.is_loggedin = true;
            }
        }
    }
});

//Global IO Code
var socket = io.connect(config.ServerUrl);

socket.on('connect', function(data) {
    if (Cookies.get('user')) {
        let user = JSON.parse(Cookies.get('user'));
        container.is_loggedin = true;

        socket.emit('join', user, true);    
    }
});

socket.on('save', function(user) {
    Cookies.set('user', JSON.stringify(user));
});

socket.on('join', function(online_users) {
    container.online_users = online_users;
});

socket.on('typing', function(user) {
    const index = (container.users_typing.push(user.nickname)) - 1;
    setTimeout(function(index) {
        container.users_typing.splice(index, 1);
    }, 1000);
});

socket.on('messages', function(user, content){
    container.users_typing = [];
    container.messages.push({user: user, content: content});
});

socket.on('logout', function(online_users) {
    container.online_users = online_users;
});

socket.on('duplicate', function() {
    alert('You are already logged in to chat. Please use the other open tab');
    socket.disconnect(true);
});

//Interval function to handle the "is typing"

setInterval(function() {
    const unique_names = [...new Set(container.users_typing)];
    if (unique_names.length == 0) {
        container.user_typing_message = '';
    }
    else if (unique_names.length == 1) {
        container.user_typing_message = `${unique_names[0]} is typing...`;
    }
    else {
        //Snippet to get uniques from https://davidwalsh.name/array-unique
        const names = unique_names.join(' and ');
        container.user_typing_message = `${names} are typing...`;
    }
}, 100);