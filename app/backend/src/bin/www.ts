import app from '../app';
import * as debugModule from 'debug';
import * as http from 'http';
import * as childProcess from 'child_process';
import * as os from 'os';
import * as io from 'socket.io';
let ws = require('ws');

const debug = debugModule('node-express-typescript:server');

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// create server and listen on provided port (on all network interfaces).
const server = http.createServer(app);
const sio = io(server);

/// Video streaming section
// Reference: https://github.com/phoboslab/jsmpeg/blob/master/stream-server.js

// var STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes
// var width = 320;
// var height = 240;

// // WebSocket server
// var wsServer = new (ws.Server)({ port: 8084 });
// console.log('WebSocket server listening on port ' + 8084);

// wsServer.on('connection', function(socket) {
//     // Send magic bytes and video size to the newly connected socket
//     // struct { char magic[4]; unsigned short width, height;}
//     var streamHeader = new Buffer(8);

//     streamHeader.write(STREAM_MAGIC_BYTES);
//     streamHeader.writeUInt16BE(width, 4);
//     streamHeader.writeUInt16BE(height, 6);
//     socket.send(streamHeader, { binary: true });

//     console.log('New WebSocket Connection (' + wsServer.clients.length + ' total)');

//     socket.on('close', function(code, message) {
//         console.log('Disconnected WebSocket (' + wsServer.clients.length + ' total)');
//     });
// });

// wsServer.broadcast = function(data, opts) {
//     for (var i in this.clients) {
//         if (this.clients[i].readyState == 1) {
//             this.clients[i].send(data, opts);
//         }
//         else {
//             console.log('Error: Client (' + i + ') not connected.');
//         }
//     }
// };

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any): number | string | boolean {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;

    debug('Listening on ' + bind);
}

function execCallback(error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        console.log('Error code: ' + error.code);
        console.log('Signal received: ' + error.signal);
    }
    console.log('Child Process STDOUT: ' + stdout);
    console.log('Child Process STDERR: ' + stderr);
};

// HTTP server to accept incoming MPEG1 stream
http.createServer((req, res) => {
    console.log('server to accept incoming MPEG1 stream started');

    // req.on('data', function(data) {
    //     wsServer.broadcast(data, { binary: true });
    // });
    sio.on('connection', (socket) => {
        req.on('data', (data) => {
            socket.emit('stream', data); 
        });
    });
}).listen(8082, () => {
    console.log('Listening for video stream on port ' + 8082);

    let codec;
    let device;
    switch (os.platform()) {
        case 'win32':
            codec = 'dshow';
            device = 'video="Logitech HD Webcam C270"';
            // codec = 'vfwcap';
            // device = 'default';
            break;
        case 'linux':
            codec = 'video4linux2';
            device = '/dev/video0';
            break;
        case 'darwin':
            codec = 'avfoundation';
            device = 'default';
            break;
    }
    childProcess.exec('ffmpeg -video_size 320x240 -framerate 30 -rtbufsize 702000k -f ' + codec + ' -i ' + device + ' -vcodec libx264 -crf 0 -preset ultrafast -f mpegts http://127.0.0.1:8082', execCallback);
    //childProcess.exec('ffmpeg -video_size 1280x720 -rtbufsize 702000k -framerate 30 -f dshow -i video="Logitech HD Webcam C270" -vcodec libx264 -crf 0 -preset ultrafast -f mpegts http://127.0.0.1:8082', execCallback);
});