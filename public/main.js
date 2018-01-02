$(document).ready(function() {
    var socket = io.connect('http://localhost:8080');
    var nickname = '';
    
    socket.on('connect', function(data) {
        nickname = prompt("What is your nickname?");
        socket.emit('join', nickname);
    });

    socket.on('messages', function(data){
        $('#chat_list').append(`<li>${data}</li>`);
    });

    $('#chat_form').click(function(e) {            
        var message = nickname + ': ' + $('#chat_input').val();
        socket.emit('messages', message);
        e.preventDefault();
    }); 
});