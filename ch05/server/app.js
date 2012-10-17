/* RESTful Web APIs - 2013 */
/* Maze+XML server implementation */

var http = require('http');
var querystring = require('querystring');
var port = (process.env.PORT||1337);

function handler(req, res) {
    res.writeHead(200, 'OK', {'content-type':'application/xml'});
    res.end('<maze></maze>');
}

http.createServer(handler).listen(port);
