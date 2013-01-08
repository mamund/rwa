/****************************
 * youtypeitwepostit.com
 * RESTful Web APIs 2013
 * Richardson/Amundsen
 ***************************/

var http = require('http');
var querystring = require('querystring');
var templates = require('./templates.js');
var messages = require('./messages.js');

var port = (process.env.PORT || 1337);
var root = '';

var htmlHeaders = {
    'Content-Type' : 'text/html'
}
var reHome = new RegExp('^\/$','i');
var reAbout = new RegExp('^\/about$','i');
var reList = new RegExp('^\/messages$','i');
var reItem = new RegExp('^\/messages\/.*','i');
var reScript = new RegExp('^\/script.js$','i');

function handler(req, res) {
    var segments, i, x, parts, flg;

    // set root
    root = 'http://'+req.headers.host;

    // parse incoming request URL
    parts = [];
    segments = req.url.split('/');
    for(i=0, x=segments.length; i<x; i++) {
        if(segments[i]!=='') {
            parts.push(segments[i]);
        }
    }

    // handle routing
    flg=false;

    // home
    if(reHome.test(req.url)) {
        flg=true;
        if(req.method==='GET') {
            sendHome(req, res);
        }
        else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
        }
    }

    // about
    if(flg===false && reAbout.test(req.url)) {
        flg=true;
        if(req.method==='GET') {
            sendAbout(req, res);
        }
        else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
        }
    }

    // list
    if(flg===false && reList.test(req.url)) {
        flg=true;
        switch(req.method) {
            case 'GET':
                sendList(req, res);
                break;
            case 'POST':
                postItem(req, res);
                break;
            default:
                sendHtmlError(req, res, 'Method Not Allowed', 405);
                break;
        }
    }

    // item
    if(flg===false && reItem.test(req.url)) {
        flg=true;
        if(req.method==='GET') {
            sendItem(req, res, parts[1]);
        }
        else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
        }
    }

    // script file
    if(flg===false && reScript.test(req.url)) {
        flg=true;
        if(req.method==='GET') {
            sendScript(req, res);
        }
        else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
        }
    }
    
    // not found
    if(flg===false) {
        sendHtmlError(req, res, 'Page Not Found', 404);
    }
}

function sendHome(req, res) {
    var t;

    try {
        t = templates('home.html');
        t = t.replace(/{@host}/g, root);
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function sendAbout(req, res) {
    var t;

    try {
        t = templates('about.html');
        t = t.replace(/{@host}/g, root);
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function sendList(req, res) {
    var t;

    try {
        t = templates('list.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@messages}/g, formatList(messages('list')));
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function sendItem(req, res, id) {
    var t;

    try {
        t = templates('item.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@msg}/g, formatItem(messages('item',id)));
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function postItem(req, res) {
    var body;

    body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
        try {
            messages('add', querystring.parse(body));
            res.writeHead(303,'See Other', {'Location' : root+'/messages'});
            res.end();
        }
        catch (ex) {
            sendHtmlError(req, res, 'Server Error', 500);
        }
    });
}

function sendScript(req, res) {
    var t;
  
    try {
        t = templates('script.js');
        t = t.replace(/{@host}/g, root);
        res.writeHead(200, {'Content-Type':'application/javascript'});
        res.end(t);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
  
}
function formatItem(item) {
    var rtn;

    rtn = '<dl>\n';
    rtn += '<dt>ID</dt><dd>'+item.id+'</dd>\n';
    rtn += '<dt>DATE</dt><dd>'+item.date+'</dd>\n';
    rtn += '<dt>MSG</dt><dd>'+item.message+'</dd>';
    rtn += '</dl>\n';

    return rtn;
}

function formatList(list) {
    var i, x, rtn;

    rtn = '<ul>\n';
    for(i=0,x=list.length;i<x;i++) {
        rtn += '<li>';
        rtn += '<a href="'+root+'/messages/'+list[i].id+'" title="' + list[i].date+'">';
        rtn += list[i].message;
        rtn += '</a></li>\n';
    }
    rtn += '</ul>\n';

    return rtn;
}

function sendHtmlError(req, res, title, code) {
    var body = '<h1>' + title + '<h1>';
    sendHtmlResponse(req, res, body, code);
}

function sendHtmlResponse(req, res, body, code) {
    res.writeHead(code, htmlHeaders);
    res.end(body);
}

// register listener for requests
http.createServer(handler).listen(port);

