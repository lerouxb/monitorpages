<!doctype html>
<html>
<head>
<title>{{pathname}}</title>
<style>
html, body, iframe {
margin: 0;
padding: 0;
border: none;
}
iframe {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
}
</style>
<script src="/socket.io/socket.io.js"></script>
<script>
var setTitle = function() {
    var iframe = document.getElementsByTagName('iframe')[0];
    if (iframe && iframe.contentDocument) {
        var idoc = iframe.contentDocument;
        var iframetag = idoc.getElementsByTagName('title')[0];
        if (iframetag) {
            var thistag = document.getElementsByTagName('title')[0];
            thistag.textContent = iframetag.textContent;
        }
    }
};
window.onload = function() {
    setTitle();
};

var socket = io.connect('/', {
    'force new connection': true
});
socket.on('connect', function() {
    socket.emit('pathname', '{{pathname}}');
    socket.on('{{pathname}}', function() {
        var iframe = document.getElementsByTagName('iframe')[0];
        var body = iframe.parentNode

        // remove the old
        body.removeChild(iframe);

        // add the new
        iframe = document.createElement('iframe');

        iframe.onload = function() {
            setTitle();
        };

        iframe.src = '{{pathname}}';
        body.appendChild(iframe);
    });
});
</script>
</head>
<body>
<iframe src="{{pathname}}"></iframe>
</body>
</html>

