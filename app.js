var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/Scripts/:script', function(req, res) {
    res.sendFile(__dirname + '/Scripts/' + req.params.script);
});

app.get('/Assets/:asset', function(req, res) {
    res.sendFile(__dirname + '/Assets/' + req.params.asset);
});

io.on('connection', function(socket) {
    console.log("Connection established.");
    socket.on('disconnect', function() {
        console.log("Connection ended.");
    });
});

http.listen(3000)
