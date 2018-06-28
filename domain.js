var EventEmitter = require("events").EventEmitter;
var domain = require("domain");

var emitter1 = new EventEmitter();

// Create a domain
var domain1 = domain.create();

domain1.on('error', function (err) {
    console.log("domain1 handled this error (" + err.message + ")");
});

// Explicit binding
domain1.add(emitter1);

emitter1.on('error', function (err) {
    console.log("listener handled this error (" + err.message + ")");
});

// ########
emitter1.emit('error', new Error('To be handled by listener'));
// ########

emitter1.removeAllListeners('error');

// ########
emitter1.emit('error', new Error('To be handled by domain1'));
// ########


var domain2 = domain.create();

domain2.on('error', function (err) {
    console.log("domain2 handled this error (" + err.message + ")");
});

// Implicit binding
domain2.run(function () {
    var emitter2 = new EventEmitter();
    emitter2.emit('error', new Error('To be handled by domain2'));
});


domain1.remove(emitter1);

// ########
emitter1.emit('error', new Error('Converted to exception. System will crash!'));
// ########


// // create a top-level domain for the server
// const domain = require('domain');
// const http = require('http');
// const serverDomain = domain.create();
//
// serverDomain.run(() => {
//   // server is created in the scope of serverDomain
//   http.createServer((req, res) => {
//     // req and res are also created in the scope of serverDomain
//     // however, we'd prefer to have a separate domain for each request.
//     // create it first thing, and add req and res to it.
//     const reqd = domain.create();
//     reqd.add(req);
//     reqd.add(res);
//     reqd.on('error', (er) => {
//       console.error('Error', er, req.url);
//       try {
//         res.writeHead(500);
//         res.end('Error occurred, sorry.');
//       } catch (er2) {
//         console.error('Error sending 500', er2, req.url);
//       }
//     });
//   }).listen(1337);
// });
