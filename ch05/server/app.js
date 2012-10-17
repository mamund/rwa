/* RESTful Web APIs - 2013 */
/* Maze+XML server implementation */

var http = require('http');
var mazes = require('./maze-data.js');

var port = (process.env.PORT||1337);
var root = '';

// document model for responses
var template = {};
template.mazeStart = '<maze version="1.0">';
template.mazeEnd = '</maze>';
template.collectionStart = '<collection href="{r}/">';
template.collectionLink = '<link href="{r}/{m}" rel="maze" />';
template.collectionEnd = '</collection>';
template.itemStart = '<item href="{r}/{m}">';
template.itemLink = '<link href="{r}/{m}/start" rel="start" />';
template.itemEnd = '</item>';
template.cellStart = '<cell href="{r}/{m}/{c}">';
template.cellLink = '<link href="{r}/{m}/{c}" rel="{d}" />';
template.cellEnd = '</cell>';
template.error = '<error><title>{t}</title></error>';

// handle request
function handler(req, res) {
    var segments, i, x, parts;

    // simple routing
    parts = [];
    segments = req.url.split('/');
    for(i=0,x=segments.length;i<x;i++) {
        if(segments[i]!=='') {
            parts.push(segments[i]);
        }
    }
    root = 'http://'+req.headers.host;
    
    if(req.url==='/favicon.ico') {
        return;
    }

    if(req.method!=='GET') {
        showError(req, res, 'Method Not Allowed', 405);
    }
    else {
        
        switch(parts.length) {
            case 0:
                showCollection(req, res);
                break;
            case 1:
                showMaze(req, res, parts[0]);
                break;
            case 2:
                showCell(req, res, parts[0], parts[1]);
                break;
            default:
                showError(req, res, 'Not Found', 404);
                break;
        }
    }
}

// show list of available mazes
function showCollection(req, res) {
    var body, list, i, x, links;
    
    links = [];

    body = '';
    body += template.mazeStart;
    body += template.collectionStart.replace('{r}',root);
    
    list = mazes('list');
    console.log('showCollection '+list);
    for(i=0,x=list.length;i<x;i++) {
        body += template.collectionLink.replace('{r}',root).replace('{m}',list[i]);
    }
    
    body += template.collectionEnd;
    body += template.mazeEnd;

    showResponse(req, res, body, 200);
}

// response for a single maze
function showMaze(req, res, maze) {
    var body, data;
    
    data = mazes('maze',maze);
    if(data!==undefined) {
        body = '';
        body += template.mazeStart;
        body += template.itemStart.replace('{m}',maze).replace('{r}',root);
        body += template.itemEnd;
        body += template.mazeEnd;

        showResponse(req, res, body, 200);
    }
    else {
        showError(req, res, 'Maze Not Found', 404);
    }
}

// response for a cell within the maze
function showCell(req, res, maze, cell) {
    var body, data;

    data = mazes('cell', maze, cell);
    if(data!==undefined) {
        body = '';
        body += template.mazeStart;
        body += template.cellStart.replace('{r}',root).replace('{m}',maze).replace('{c}',cell);
        body += template.cellEnd;
        body += template.mazeEnd;
    
        showResponse(req, res, body, 200);
    }
    else {
        showError(req, res, 'Maze/Cell Not Found', 404);
    }
}

// unexpected request
function showError(req, res, title, code) {
    var body = template.mazeStart
        + template.error.replace('{t}',title)
        + template.mazeEnd;
    showResponse(req, res, body, code);
}

// return response to caller
function showResponse(req, res, body, code) {
    res.writeHead(code,{'content-type':'application/xml'});
    res.end(body);
}

// wait for someone to call
http.createServer(handler).listen(port);
