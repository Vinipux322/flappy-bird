// Зависимости
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var players = [];

// Запуск сервера
server.listen(5001);
console.log("Server Started!");

// Коннект юзера
io.on('connection', function(socket) {
  socket.on('new player', function(nickname) { // Ловим ивент
    var check = false;
    players.forEach(function(player) {
      if (player[0] === nickname) { // А нужно ли нам его обновлять?
        check = true;
      };
    });
    if (check === false) {
      var arr = [nickname,0];
      players.push(arr);
    }
  });
  socket.on('updateScore', function(nickname,score) { // Ловим ивент обновления счета
    players.forEach(function(player) {
      if (player[0] === nickname && player[1] >= 0 && player[1] < score) { // А нужно ли нам его обновлять?
        player[1] = score;
      };
    });
  });
});

function sortThis(player1, player2) {
  if (player2[1] > player1[1]) {
    return 1;
  } else if (player2[1] === player1[1]) {
    return 0;
  } else {
    return -1;
  }
}

// Ставим таймер и 60 раз в секунду посылам текущее состояние мира(было востребованно в версии с онлайном)
setInterval(function() {
  players = players.sort(sortThis);
  io.sockets.emit('score', players);
}, 100);
