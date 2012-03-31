#!/usr/bin/env node

var
    express = require('express'),
    socketio = require('socket.io'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    path = require('path'),
    _ = require('underscore'),
    app = express.createServer();
    io = socketio.listen(app);

app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
}));

var
    listTemplate = fs.readFileSync("list.tpl", 'utf8'),
    monitorTemplate = fs.readFileSync("monitor.tpl", 'utf8');

// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

var getHTMLPaths = function(done) {
    var cwd = process.cwd();
    walk(cwd, function(err, results) {
        var excludingModules = _.filter(results, function(path) {
            return (path.indexOf('/node_modules/') === -1);
        });
        var htmlPaths = _.filter(excludingModules, function(path) {
            return (path.slice(-5) == '.html');
        });
        done(null, htmlPaths);
    });
};

app.get('/', function(req, res) {
    var cwd = process.cwd();
    getHTMLPaths(function(err, htmlPaths) {
        htmlPaths = _.map(htmlPaths, function(path) {
            return path.replace(cwd, '')
        });
        var elements = _.map(htmlPaths, function(pathname) {
            return '<li><a href="/monitor?pathname='
                +pathname+'">'+pathname+'</a></li>';
        });
        res.send(listTemplate.replace('{{pages}}', elements.join('\n')));
    });
});
app.get('/monitor', function(req, res) {
    var regex = new RegExp('{{pathname}}', 'g');
    res.send(monitorTemplate.replace(regex, req.query.pathname));
});

var
    pathEvents = new EventEmitter(), // events are pathnames
    socketEvents = {}, // keys are sockets, values are pathnames
    socketCallbacks = {}; // keys are sockets, values are callbacks

var disconnect = function(socket) {
    var pathname = socketEvents[socket];
    if (pathname) {
        pathEvents.removeListener(pathname, socketCallbacks[socket]);
        delete socketEvents[socket];
        delete socketCallbacks[socket];
    }
};

var connect = function(socket, pathname) {
    var callback = function() {
        socket.emit(pathname);
    };
    pathEvents.on(pathname, callback);
    socketEvents[socket] = pathname;
    socketCallbacks[socket] = callback;
};

io.sockets.on('connection', function(socket) {
    socket.on('pathname', function(pathname) {
        if (socketEvents[socket]) {
            disconnect(socket);
        }
        connect(socket, pathname);
    });
    socket.on('disconnect', function() {
        disconnect(socket);
    });
});

app.use(express.static(__dirname));

var PORT = '4000';
app.listen(PORT);
console.log("listening on", PORT);

var change = _.debounce(function(pathname) {
    pathEvents.emit(pathname);
}, 100);

getHTMLPaths(function(err, htmlPaths) {
    var cwd = process.cwd();
    _.each(htmlPaths, function(path) {
        fs.watch(path, function(event, filename) {
            if (filename == 'index.html') {
                var pathname = path.replace(cwd, '');
                change(pathname);
            }
        });
    });
});
