#!/usr/bin/env node

CURRENTLY_PLAYING_FILE = "/tmp/.current_playing";

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

  player = spawn('omxplayer', ['-o', 'hdmi', 'rtmp://marcus.ethor.net:443/live/live' + stream_name]);

  player.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  player.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  player.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  player.on('error', (err) => {
    console.log('Failed to start child process. ' + err);
  });

  res.redirect(301, '/');
});

app.post('/play_twitch', function(req, res) {
  if (player) {
    player.kill();
  }

  var stream_name = req.body.twitch_stream_name;
  currently_playing.set(stream_name);

  var args = ['twitch.tv/' + stream_name, 'best', '-np', 'omxplayer -o hdmi'];
  console.log('starting the stream: ' + args.join(' '));

  player = spawn('livestreamer', args);

  player.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  player.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  player.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  player.on('error', (err) => {
    console.log('Failed to start child process. ' + err);
  });

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
