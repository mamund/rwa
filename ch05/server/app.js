/* RESTful Web APIs - 2013 */
/* Maze+XML server implementation */

var http = require('http');
var querystring = require('querystring');
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

function showCollection(req, res) {
    var body = template.mazeStart 
        + template.collectionStart.replace('{r}',root).replace('{m}','mid')
        + template.collectionEnd
        + template.mazeEnd;
    showResponse(req, res, body, 200);
}

function showMaze(req, res, parts) {
    var body = template.mazeStart
        + template.itemStart.replace('{m}',parts[1]).replace('{r}',root)
        + template.itemEnd
        + template.mazeEnd;
    showResponse(req, res, body, 200);
}

function showCell(req, res, parts) {
    var body = template.mazeStart
        + template.cellStart.replace('{r}',root).replace('{m}',parts[1]).replace('{c}',parts[2])
        + template.cellEnd
        + template.mazeEnd;
    showResponse(req, res, body, 200);
}

function showError(req, res, title, code) {
    var body = template.mazeStart
        + template.error.replace('{t}',title)
        + template.mazeEnd;
    showResponse(req, res, body, code);
}

function showResponse(req, res, body, code) {
    res.writeHead(code,{'content-type':'application/xml'});
    res.end(body);
}

http.createServer(handler).listen(port);
