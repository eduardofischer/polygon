const socket = io();

let players_list = {}; // PLayers List

function login() {
    const name = document.querySelector('#username_input').value;
    const color = document.querySelector('#colors').dataset.color;
    socket.emit('new_player', {user: name});

    return {name, color};
}

socket.on('state_update', list => {
    players_list = list;
});

function update_server(player) {
    socket.emit('player_update', player);
}
