#!/env/node

var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var app = express();

var player;

app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/play_ethor', function(req, res) {
	if (player) {
		player.kill();
	}

    player = spawn('vlc', ['rtmp://marcus.ethor.net:443/live/live' + req.body.ethor_stream_name]);
    res.redirect(301, '/');
});

app.post('/play_twitch', function(req, res) {
	if (player) {
		player.kill();
	}

    player = spawn('livestreamer', ['twitch.tv/' + req.body.twitch_stream_name, 'best', '-np', '"vlc"']);
    res.redirect(301, '/');
});

app.post('/stop_stream', function(req, res) {
	if (player) {
		player.kill();
	}

    res.redirect(301, '/');
});

app.get('/', function (req, res) {
    res.render('index', {});
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
