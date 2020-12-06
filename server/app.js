var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');

var app = express();
var port = process.env.PORT || 3000;
var server = http.createServer(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../dist')));

/* GET home page. */
app.get('/', function(req, res, next) {
  res.sendFile('index.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.sendStatus(404);
});

server.listen(port, () => {
  console.log(`\nServidor rodando na porta ${port}!`);
});

// GAME
const TICK_RATE = 30;

const io = require('socket.io')(server);
const { handle_connection, game_loop } = require('../server/game_server.js')

// Socket.io Connection
io.on('connection', handle_connection);

setInterval(game_loop, 1000/TICK_RATE);

