var socket = io.connect(':5001', {secure: true});

var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

ctx.drawImageRotated = (image, x, y, w, h, radians) => {
  ctx.save();
  ctx.translate(x+w/2, y+h/2);
  ctx.rotate(radians);
  ctx.translate(-x-w/2, -y-h/2);
  ctx.drawImage(image, x, y, w, h);
  ctx.restore();
}

var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeUp = new Image();
var pipeBottom = new Image();

bird.src = "img/bird.png";
bg.src = "img/bg.png";
fg.src = "img/fg.png";
pipeUp.src = "img/pipeUp.png";
pipeBottom.src = "img/pipeBottom.png";

var gap = 90;

// Нажатие кнопки

document.addEventListener("keydown", moveUp);
cvs.addEventListener("click", moveUp);
document.addEventListener("touchend", moveUp);

// Позиция птички

var xPos = 10;
var yPos = 150;
var grav = 1.5;
var score = 0;
var ingame = false;
var updateScore = false;
var nickname = false;
var top = false;
var temp_ypos = yPos;
var top_players = [];
var heightThis = 70

var fly = new Audio;
var score_audio = new Audio;

fly.src = "sounds/fly.mp3"
score_audio.src = "sounds/score.mp3"

socket.on('score', function(players) {
  top_players = players;
});

function moveUp() {
  if (nickname != false) {
    if (ingame == true) {
      oldT = Date.now();
      temp_ypos = yPos;
      t = 0;
      fly.play();
    }else{
      ingame = true;
      updateScore = false;
      xPos = 10;
      yPos = 150;
      score = 0;
      oldT = Date.now();
      t = 0;
      temp_ypos = yPos;
      pipe = [];
      pipe[0] = {
        x : cvs.width,
        y : 0
      }
    }
  }
}

// Генерация Блоков
var pipe = [];

pipe[0] = {
  x : cvs.width,
  y : 0
}

var v = 20
var oldT = Date.now();
var t = 0;
var v0 = 8;
var g = 9.8;

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

function draw() {
  ctx.drawImage(bg, 0, 0);

  if (nickname != false) {

    var oldx = (v0*Math.sin(Math.radians(75))*t-((g*Math.pow(t,2))/2));
    var oldy = v0*Math.sin(Math.radians(75))*t;
    t = ((Date.now() - oldT)/1000)*3;
    var y = (v0*Math.sin(Math.radians(75))*t-((g*Math.pow(t,2))/2));
    var x = v0*Math.sin(Math.radians(75))*t;
    yPos = temp_ypos-y*10;

    for (var i = 0; i < pipe.length; i++) {
      ctx.drawImage(pipeUp, pipe[i].x, pipe[i].y);
      ctx.drawImage(pipeBottom, pipe[i].x, pipe[i].y + pipeUp.height + gap);

      if (ingame == true) {
        pipe[i].x--;

        if(pipe[i].x == 125) {
          pipe.push({
            x : cvs.width,
            y : Math.floor(Math.random()*pipeUp.height) - pipeUp.height
          })
        }
      }

      if (xPos + bird.width >= pipe[i].x && xPos <= pipe[i].x + pipeUp.width && (yPos <= pipe[i].y + pipeUp.height || yPos + bird.height >= pipe[i].y + pipeUp.height + gap) || yPos + bird.height >= cvs.height - fg.height
      || yPos + bird.height >= cvs.height || yPos + bird.height <= 0) {
        ingame = false;
      }
      if(pipe[i].x == 5) {
        score++;
        score_audio.play();
      }
    }
    ctx.drawImage(fg, 0, cvs.height - fg.height);
    ctx.drawImageRotated(bird, x, yPos, 38, 26, Math.atan((y-oldy)/(oldx-x)));

    ctx.fillStyle = "#000";
    ctx.font = "24px Verdana";
    ctx.fillText("Счет: " + score, 10, cvs.height - 20)
    if (ingame == false) {
      ctx.fillStyle = "#000";
      ctx.font = "10px Verdana";
      ctx.fillText("Топ игроков:", 65, 50);
      for (var i = 0; i < top_players.length && i < 10; i++) {
        ctx.fillText("# " + (i+1) +". " + top_players[i][0] + " - " + top_players[i][1], 65, heightThis+25*i);
      }
      ctx.font = "24px Verdana";
      ctx.fillStyle = "#000";
      ctx.fillText("Игра завершена.", 50, cvs.height-(cvs.height/2)+180)
      ctx.font = "10px Verdana";
      ctx.fillText("Нажмите любую клавишу, чтобы продолжить", 30, cvs.height-(cvs.height/2)+200)
      if (updateScore == false) {
        socket.emit('updateScore',nickname,score);
        updateScore = true;
      }
    }
  }else{
    document.getElementById('nickname').style.display = "block";
    document.getElementById('button').style.display = "block";
    document.getElementById('p').style.display = "block";
  }
  requestAnimationFrame(draw);
}

function showDiv() {
 nickname = document.getElementById('nickname').value
 document.getElementById('nickname').style.display = "none";
 document.getElementById('button').style.display = "none";
 document.getElementById('p').style.display = "none";
 socket.emit('new player', nickname);
 ingame = true
}

pipeBottom.onload = draw;
