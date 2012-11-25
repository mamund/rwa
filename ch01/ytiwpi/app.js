/****************************
 * youtypeitwepostit.com
 * RESTful Web APIs 2013
 * Richardson/Amundsen
 ***************************/

var http = require('http');
var templates = require('./templates.js');
//var messages = require('./messages.js');

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
        case 0:
            flg = true;
            if(req.method==='GET') {
                showHome(req, res);
            }
            else {
                showError(req, res, 'Method Not Allowed', 405);
            }
            break;
        case 1:
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
                showError(req, res, 'Page Not Found', 404);
            }
            break;
        default:
            showError(req, res, 'Page Not Found', 404);
            break;
    }
}

function showHome(req, res) {
    var t = templates('home.html');
    if(t!==undefined) {
        t = t.replace(/{@host}/g, root);
        showResponse(req, res, t, 200);
    }
    else {
        showError(req, res, 'Server Error', 500);
    }
}

function showAbout(req, res) {
    showResponse(req, res, '<h1>about</h1>', 200);
}

function showMessages(req, res) {
    var t = templates('messages.html');
    if(t!==undefined) {
        t = t.replace(/{@host}/g, root);
        showResponse(req, res, t, 200);
    }
    else {
        showError(req, res, 'Server Error', 500);
    }
}

function postMessage(req, res) {
    res.writeHead(301, 'Temporary Redirect',{'Location' : root+'/'});
    res.end();
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

