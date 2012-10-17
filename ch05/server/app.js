/* RESTful Web APIs - 2013 */
/* Maze+XML server implementation */

var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var port = (process.env.PORT||1337);
var root = '';
var mazeFile = 'five-by-five.js';

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

    // simple routing
    var parts = req.url.split('/');
    root = 'http://'+req.headers.host;
    
    if(req.method!=='GET') {
        showError(req, res, 'Method Not Allowed', 405);
    }
    else {
        switch(parts.length) {
            case 1:
                showCollection(req, res);
                break;
            case 2:
                showMaze(req, res, parts);
                break;
            case 3:
                showCell(req, res, parts);
                break;
            default:
                showError(req, res, 'Not Found', 404);
                break;
        }
    }
}

// show list of available mazes
function showCollection(req, res) {
    // get list of available mazes
    // format and send response
    var body = template.mazeStart 
        + template.collectionStart.replace('{r}',root).replace('{m}','mid')
        + template.collectionEnd
        + template.mazeEnd;
    showResponse(req, res, body, 200);
}

// response for a single maze
function showMaze(req, res, parts) {
    // find requested maze (on disk)
    // format and send response
    var body = template.mazeStart
        + template.itemStart.replace('{m}',parts[1]).replace('{r}',root)
        + template.itemEnd
        + template.mazeEnd;
    showResponse(req, res, body, 200);
}

// response for a cell within the maze
function showCell(req, res, parts) {
    // find cell within requested maze
    // format and send response
    var body = template.mazeStart
        + template.cellStart.replace('{r}',root).replace('{m}',parts[1]).replace('{c}',parts[2])
        + template.cellEnd
        + template.mazeEnd;
    showResponse(req, res, body, 200);
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
