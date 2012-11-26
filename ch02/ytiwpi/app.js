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
};
var reHome = new RegExp('^\/$','i');
var reAbout = new RegExp('^\/about$','i');
var reList = new RegExp('^\/messages$','i');
var reItem = new RegExp('^\/messages\/.*','i');

var cjHeaders = {
    'Content-Type' : 'application/json'
};
var reAPIList = new RegExp('^\/api\/$','i');
var reAPIItem = new RegExp('^\/api\/.*','i');

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

    // API List
    if(flg===false && reAPIList.test(req.url)) {
        flg=true;
        switch(req.method) {
            case 'GET':
                sendAPIList(req, res);
                break;
            case 'POST':
                postAPIItem(req, res);
                break;
            default:
                sendAPIError(req, res, 'Method Not Allowed', 405);
                break;
        }
    }

    // API Item
    if(flg===false && reAPIItem.test(req.url)) {
        flg=true;
        switch(req.method) {
            case 'GET':
                sendAPIItem(req, res, parts[1]);
                break;
            case 'PUT':
                updateAPIItem(req, res, parts[1]);
                break;
            case 'DELETE':
                removeAPIItem(req, res, parts[1]);
                break;
            default:
                sendAPIError(req, res, 'Method Not Allowed', 405);
                break;
        }
    }

    // not found
    if(flg===false) {
        sendHtmlError(req, res, 'Page Not Found', 404);
    }
}

function sendAPIList(req, res) {
    var t;

    t = templates('list.js');
    t = t.replace(/{@host}/g, root);
    t = t.replace(/{@list}/g, formatAPIList(messages('list')));
    sendAPIResponse(req, res, t, 200);
}

function sendAPIItem(req, res, id) {
    var t;

    t = templates('list.js');
    t = t.replace(/{@host}/g, root);
    t = t.replace(/{@list}/g, formatAPIItem(messages('item', id)));
    sendAPIResponse(req, res, t, 200);
}

function updateAPIItem(req, res, id) {
    var body, item, msg;

    body = '';
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        msg = JSON.parse(body);
        item = messages('update', id, {message:msg.template.data[0].value});
        res.writeHead(303, 'See Other', {'Location' : root + '/api/' + id});
        res.end();
    });
}

function removeAPIItem(req, res, id) {
    var t;

    messages('remove', id);
    t = templates('list.js');
    t = t.replace(/{@host}/g, root);
    t = t.replace(/{@list}/g, formatAPIList(messages('list')));
    sendAPIResponse(req, res, t, 200);
}

function postAPIItem(req, res) {
    var body, item, msg;

    body = '';
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        msg = JSON.parse(body);
        item = messages('add', {message : msg.template.data[0].value});
        res.writeHead(201, 'Created', {'Location' : root+ '/api/'+ item.id});
        res.end();
    });
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

    //try {
        t = templates('list.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@messages}/g, formatList(messages('list')));
        sendHtmlResponse(req, res, t, 200);
    //}
    //catch (ex) {
    //    sendHtmlError(req, res, 'Server Error', 500);
    //}
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

function formatAPIItem(item) {
    var rtn = {}

    rtn.href = root + '/api/' + item.id;
    rtn.data = [];
    rtn.data.push({name : "text", value : item.message});
    rtn.data.push({name : "date_posted", value : item.date});

    return "[" + JSON.stringify(rtn, null, 4) + "]";
}

function formatAPIList(list) {
    var i, x, rtn, item;

    rtn = [];
    for(i=0,x=list.length; i<x; i++) {
        item = {};
        item.href = root + '/api/' + list[i].id;
        item.data = [];
        item.data.push({name:"text", value:list[i].message});
        item.data.push({name:"date_posted", value:list[i].date});
        rtn.push(item);
    }

    return JSON.stringify(rtn, null, 4);
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

function sendAPIResponse(req, res, body, code) {
    res.writeHead(code, cjHeaders);
    res.end(body);
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

