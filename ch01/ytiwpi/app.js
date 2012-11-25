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

var headers = {
    'Content-Type' : 'text/html'
}

function handler(req, res) {
    var segments, i, x, parts, flg;

    // set globl root
    root = 'http://'+req.headers.host;

    // simple routing
    parts = [];
    segments = req.url.split('/');
    for(i=0,x=segments.length;i<x;i++) {
        if(segments[i]!=='') {
            parts.push(segments[i]);
        }
    }

    // ignore these reqs
    if(req.url==='/favicon.ico') {
        return;
    }

    // handle routing
    flg = false;
    switch(parts.length) {
        case 0: // home
            flg = true;
            if(req.method==='GET') {
                showHome(req, res);
            }
            else {
                showError(req, res, 'Method Not Allowed', 405);
            }
            break;
        case 1: // message list or about
            if(flg===false && parts[0].toLowerCase()==='about') {
                flg = true;
                if(req.method==='GET') {
                    showAbout(req, res);
                }
                else {
                    showError(req, res, 'Method Not Allowed', 405);
                }
            }
            if(flg===false && parts[0].toLowerCase()==='messages') {
                flg = true;
                switch(req.method) {
                    case 'GET':
                        showMessages(req, res);
                        break;
                    case 'POST':
                        postMessage(req, res);
                        break;
                    default:
                        showError(req, res, 'Method Not Allowed', 405);
                }
            }
            
            if(flg===false) {
                showError(req, res, 'Page Not Found (1)', 404);
            }
            break;
        case 2: // single message
            if(flg===false && parts[0].toLowerCase()==='messages') {
                flg=true;
                if(req.method==='GET') {
                    showMessage(req, res, parts[1]);
                }
                else {
                    showError(req, res, 'Method Not Allowed', 405);
                }
            }
            else {
                showError(req, res, 'Page Not Found (2)', 404);
            }
            break;
        default: // unknown request
            showError(req, res, 'Page Not Found (x)', 404);
            break;
    }
}

function showHome(req, res) {
    var t;

    try {
        t = templates('home.html');
        t = t.replace(/{@host}/g, root);
        showResponse(req, res, t, 200);
    }
    catch (ex) {
        showError(req, res, 'Server Error', 500);
    }
}

function showAbout(req, res) {
    var t;

    try {
        t = templates('about.html');
        t = t.replace(/{@host}/g, root);
        showResponse(req, res, t, 200);
    }
    catch (ex) {
        ShowError(req, res, 'Server Error', 500);
    }
}

function showMessages(req, res) {
    var t;

    try {
        t = templates('list.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@messages}/g, formatList(messages('list')));
        showResponse(req, res, t, 200);
    }
    catch (ex) {
        showError(req, res, 'Server Error', 500);
    }
}

function showMessage(req, res, id) {
    var t;

    try {
        t = templates('item.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@msg}/g, formatItem(messages('item',id)));
        showResponse(req, res, t, 200);
    }
    catch (ex) {
        showError(req, res, 'Server Error', 500);
    }
}

function postMessage(req, res) {
    var body;

    body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
        try {
            messages('add', querystring.parse(body));
            res.writeHead(301,'Redirect', {'Location' : root+'/messages'});
            res.end();
        }
        catch (ex) {
            showError(req, res, 'Server Error', 500);
        }
    });
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

function showError(req, res, title, code) {
    var body = '<h1>' + title + '<h1>';
    showResponse(req, res, body, code);
}

function showResponse(req, res, body, code) {
    res.writeHead(code, headers);
    res.end(body);
}

// register listener for requests
http.createServer(handler).listen(port);

