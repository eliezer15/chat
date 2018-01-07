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
        'chat_input': '',
        'room_name': 'El Club De Los Tigritos',
        'messages': [],
        'online_users':[],
        'user_typing_message': '',
        'users_typing':[]
    },
    watch: {
        chat_input: function(new_input) {
            socket.emit('typing');
        }
    },
    methods: {
        send_message: function(e) {
            socket.emit('messages', this.chat_input);
            this.chat_input = '';
        },
    }
});

//Global IO Code
var socket = io.connect(config.ServerUrl);

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