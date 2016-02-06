#!/env/node

CURRENTLY_PLAYING_FILE = ".current_playing";

var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var fs = require('fs');
var app = express();

var player;

var currently_playing = {
  get: function() {
    if (!fs.existsSync(CURRENTLY_PLAYING_FILE)) return null;
    return fs.readFileSync(CURRENTLY_PLAYING_FILE);
  },
  set: function(stream) {
    fs.writeFileSync(CURRENTLY_PLAYING_FILE, stream, 'utf8');
  },
  unset: function() {
    if (!fs.existsSync(CURRENTLY_PLAYING_FILE)) return null;
    fs.unlink(CURRENTLY_PLAYING_FILE);
  }
}

app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/play_ethor', function(req, res) {
  if (player) {
    player.kill();
  }

  var stream_name = req.body.ethor_stream_name;
  currently_playing.set(stream_name);
  player = spawn('vlc', ['rtmp://marcus.ethor.net:443/live/live' + stream_name]);
  res.redirect(301, '/');
});

app.post('/play_twitch', function(req, res) {
  if (player) {
    player.kill();
  }

  var stream_name = req.body.twitch_stream_name;
  currently_playing.set(stream_name);
  player = spawn('livestreamer', ['twitch.tv/' + stream_name, 'best', '-np', '"vlc"']);
  res.redirect(301, '/');
});

app.post('/stop_stream', function(req, res) {
  if (player) {
    player.kill();
  }

  currently_playing.unset();
  res.redirect(301, '/');
});

app.get('/', function (req, res) {
  res.render('index', { currently_playing: currently_playing.get() });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
