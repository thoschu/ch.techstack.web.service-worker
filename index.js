const cluster = require('cluster');
const http = require('http');
const os = require('os');
const R = require('ramda');
const webSocket = require('websocket');

if (cluster.isMaster) {
    const numCPUs = os.cpus();
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    R.forEach((cpu) => {
        cluster.fork();
    }, numCPUs);

    cluster.on('exit', (worker, code, signal) => {
        console.log(`${code}: worker ${worker.process.pid} died with signal: ${signal}`);
    });
} else {
    const WebSocketServer = webSocket.server;

    const server = http.createServer((request, response) => {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    server.listen(8888, () => {
        console.log((new Date()) + ' Server is listening on port 8888');
    });

    const wsServer = new WebSocketServer({
        httpServer: server,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });

    const originIsAllowed = (origin) => {
        // put logic here to detect whether the specified origin is allowed.
        console.log(origin);
        return true;
    };

    wsServer.on('request', (request) => {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        } else {
            const connection = request.accept('echo-protocol', request.origin);
            console.log((new Date()) + ' Connection accepted.');
            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    console.log('Received Message: ' + message.utf8Data);
                    connection.sendUTF(message.utf8Data);
                } else if (message.type === 'binary') {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    connection.sendBytes(message.binaryData);
                } else {}
            });
            connection.on('close', (reasonCode, description) => {
                console.log((new Date()) + reasonCode + ': Peer ' + connection.remoteAddress + ' disconnected: ' + description);
            });
        }
    });

    console.log(`Worker ${process.pid} started`);
}
