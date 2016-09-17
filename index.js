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

var player_operation = {
  kill: function() {
    if (player) {
    try {
      process.kill(-player.pid);
    } catch (ex) {
      console.log(ex);
    }

    player = null;
  }
  }
}

app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); 
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/play_ethor', function(req, res) {
  player_operation.kill();

  var stream_name = req.body.ethor_stream_name;
  currently_playing.set(stream_name);

  player = spawn('omxplayer', ['-o', 'hdmi', 'rtmp://stirling.ethor.net:443/live/live' + stream_name], {detached: true});

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
  player_operation.kill();

  var stream_name = req.body.twitch_stream_name;
  var quality = req.body.twitch_quality;

  currently_playing.set(stream_name);

  var args = ['--http-header', 'Client-ID=56q7z6tedgcd9fs0dl6uw60h1nw48rw', 'twitch.tv/' + stream_name, quality];//, '-np', 'omxplayer -o hdmi'];
  console.log('starting the stream: ' + args.join(' '));

  player = spawn('livestreamer', args, {detached: true});

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
  player_operation.kill();
  currently_playing.unset();
  res.redirect(301, '/');
});

app.get('/', function (req, res) {
  res.render('index', { currently_playing: currently_playing.get() });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
