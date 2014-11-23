'use strict';

const
  fs = require('fs'),
  zmq = require('zmq'),
  // socket to reply to client requests
  responder = zmq.socket('rep');

// handle incoming requests
responder.on('message', function(data) {
  // parse incoming message
  let request = JSON.parse(data);

  console.log('Received request to get: ' + request.path);

  // read file and reply with content
  try {
    fs.readFile(request.path, function (err, content) {
      if (err) {
        throw err;
      }

      console.log('Sending response content');

      responder.send(JSON.stringify({
        content: content.toString(),
        timestamp: Date.now(),
        pid: process.pid
      }));
    });
  } catch (e) {
    console.log('Sending response error');

    responder.send(JSON.stringify({
      error: e.message,
      timestamp: Date.now(),
      pid: process.pid
    }));
  }
});

// listen on TCP port 5433
responder.bind('tcp://127.0.0.1:5433', function(err) {
  console.log('Listening for zmq requesters...');
});

// close the responder when the Node process ends
process.on('SIGINT', function() {
  console.log('Shutting down...');

  responder.close();
});

// close the responder when the Node process is terminated
process.on('SIGTERM', function() {
  console.log('Shutting down...');

  responder.close();
});

// handle any uncaught exceptions
// the default action (which is to print a stack trace and exit) will not occur
// @see http://nodejs.org/api/process.html#process_event_uncaughtexception
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});


console.log('pid ' + process.pid);
