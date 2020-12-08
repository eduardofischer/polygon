require('module-alias/register')
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { handle_connection, game_loop, cmd_prompt } = require('./game_server.js')

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:9000",
    methods: ["GET", "POST"]
  }
});

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

// Socket.io Connection
io.on('connection', handle_connection);

// GAME
const TICK_RATE = 30;
setInterval(game_loop, 1000/TICK_RATE, io);

// Web Server
server.listen(port, () => {
  console.log(`\nServidor rodando na porta ${port}!\n`);
  cmd_prompt();
});


