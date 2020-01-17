const socket = io();

let players_list = {}; // PLayers List

function login() {
    const username = document.querySelector('#username_input').value;
    socket.emit('new_player', {user: username});

    return username;
}

socket.on('state_update', list => {
    players_list = list;
});

function update_server(player) {
    socket.emit('player_update', player);
}
