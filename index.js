#!/env/node

var express = require('express');
var bodyParser = require('body-parser');
var spawn = require('child_process').spawn;
var app = express();

twitch_urls = ["arteezy", "joindota"];

app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/play', function(req, res) {
    spawn('touch', [req.body.stream]);
    res.redirect(301, '/');
});

app.get('/', function (req, res) {
    res.render('index', {});
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
