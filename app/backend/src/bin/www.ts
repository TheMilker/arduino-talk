import app from '../app';
import * as debugModule from 'debug';
import * as http from 'http';
import * as childProcess from 'child_process';
import * as os from 'os';
import * as io from 'socket.io';

const debug: any = debugModule('node-express-typescript:server');

// get port from environment and store in Express.
const port: any = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// create server and listen on provided port (on all network interfaces).
const server: any = http.createServer(app);
const sio: any = io(server);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any): number | string | boolean {
    'use strict';
    let normalizedPort: any = parseInt(val, 10);

    if (isNaN(normalizedPort)) {
        // named pipe
        return val;
    }

    if (normalizedPort >= 0) {
        // port number
        return normalizedPort;
    }

    return false;
}

/**
 * event listener for HTTP server "error" event.
 */
function onError(error: any): void {
    'use strict';
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind: any = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

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
function onListening(): void {
    'use strict';
    let addr: any = server.address();
    let bind: any = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;

    debug('Listening on ' + bind);
}

function execCallback(error: any, stdout: any, stderr: any): void {
    'use strict';
    if (error) {
        console.log(error.stack);
        console.log('Error code: ' + error.code);
        console.log('Signal received: ' + error.signal);
    }
    console.log('Child Process STDOUT: ' + stdout);
    console.log('Child Process STDERR: ' + stderr);
};

// http server to accept incoming MPEG1 stream
http.createServer((req: any, res: any): void => {
    console.log('server to accept incoming MPEG1 stream started');

    // req.on('data', function(data) {
    //     wsServer.broadcast(data, { binary: true });
    // });
    sio.on('connection', (socket: any) => {
        req.on('data', (data: any) => {
            console.log('sending data', data);
            socket.emit('stream', {streamData: data});
        });
    });
}).listen(8082, (): void => {
    console.log('Listening for video stream on port ' + 8082);

    let codec: any;
    let device: any;
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
        default:
            throw new Error('platform ' + os.platform() + ' not supported.');
    }
    // childProcess.exec('ffmpeg -video_size 320x240 -framerate 30 -rtbufsize 702000k -f ' + codec + ' -i ' + device + ' -vcodec libx264 -crf 0 -preset ultrafast -f mpegts http://127.0.0.1:8082', execCallback);
    // childProcess.exec('ffmpeg -video_size 1280x720 -rtbufsize 702000k -framerate 30 -f dshow -i video="Logitech HD Webcam C270" -vcodec libx264 -crf 0 -preset ultrafast -f mpegts http://127.0.0.1:8082', execCallback);
    childProcess.exec('ffmpeg -s 320x240 -f vfwcap -i video="Logitech HD Webcam C270" -f mpeg1video -b 800k -r 30 http://127.0.0.1:8082', execCallback);

});
