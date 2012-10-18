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
template.collectionStart = '<collection href="{l}/">';
template.collectionLink = '<link href="{l}" rel="maze" />';
template.collectionEnd = '</collection>';
template.itemStart = '<item href="{l}">';
template.itemLink = '<link href="{l}/start" rel="start" />';
template.itemEnd = '</item>';
template.cellStart = '<cell href="{l}" rel=="current">';
template.cellLink = '<link href="{l}" rel="{d}"/>';
template.cellEnd = '</cell>';
template.link = '<link href="{l}" rel="{d}"/>'
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
    body += template.collectionStart.replace('{l}',root);
    
    list = mazes('list');
    console.log('showCollection '+list);
    for(i=0,x=list.length;i<x;i++) {
        body += template.collectionLink.replace('{l}',root+'/'+list[i]);
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
        body += template.itemStart.replace('{l}',root+'/'+maze);
        body += template.link.replace('{l}',root+'/'+maze+'/0').replace('{d}','start');
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
    var body, data, rel, mov, sq, z, ex;

    z = parseInt(cell, 10);
    sq = Math.sqrt(25);
    ex = 24;
    console.log(sq);
    rel = ['north', 'west', 'south', 'east'];
    mov = [z-1, z+(sq*-1), z+1, z+sq]
    
    if(z===999) {
        data = [1,1,1,1];
    }
    else {
        data = mazes('cell', maze, cell);
    }
    console.log('c ',cell);
    console.log('cell '+data);
    
    if(data!==undefined) {
        body = '';
        body += template.mazeStart;
        body += template.cellStart.replace('{l}',root+'/'+maze+'/'+cell);
        for(i=0,x=data.length;i<x;i++) {
            if(data[i]===0) {
                body += template.link.replace('{l}',root+'/'+maze+'/'+mov[i]).replace('{d}',rel[i]);
            }
        }
        if(z===ex) {
            body += template.link.replace('{l}',root+'/'+maze+'/999').replace('{d}','exit');
        }
        body += template.link.replace('{l}',root+'/'+maze).replace('{d}','maze');
        body += template.link.replace('{l}',root).replace('{d}', 'collection');
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
