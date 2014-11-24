'use strict';

const
  cluster = require('cluster'),
  zmq = require('zmq');

if (cluster.isMaster) {
  let
    pusher = zmq.socket('push').bind('ipc://bidirectional-messaging-push.ipc'),
    puller = zmq.socket('pull').bind('ipc://bidirectional-messaging-pull.ipc'),
    readyWorkers = 0;

  puller.on('message', function(data) {
    let request = JSON.parse(data.toString());

    if (request.type === 'ready') {
      console.log('Worker ' + request.pid + ' ready');

      readyWorkers++;

      if (readyWorkers === 3) {
        console.log('Sending out job messages');

        // send out thirty job messages
        for (let i=0; i<30; i++) {
          pusher.send(JSON.stringify({
            type: 'job'
          }));
        }
      }
    } else if (request.type === 'result') {
      console.log('Result: ' + request.pid);
    } else {
      throw 'Un-supported message type';
    }
  });

  // spin up three workers
  for (let i=0; i<3; i++) {
    cluster.fork();
  }
} else {
  let
    puller = zmq.socket('pull').connect('ipc://bidirectional-messaging-push.ipc'),
    pusher = zmq.socket('push').connect('ipc://bidirectional-messaging-pull.ipc');

  puller.on('message', function(data) {
    let request = JSON.parse(data.toString());

    if (request.type === 'job') {
      pusher.send(JSON.stringify({
        type: 'result',
        pid: process.pid
      }));
    } else {
      throw 'Un-supported message type';
    }
  });

  pusher.send(JSON.stringify({
    type: 'ready',
    pid: process.pid
  }));
}
