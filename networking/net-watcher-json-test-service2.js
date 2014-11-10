'use strict';

const
  net = require('net'),
  server = net.createServer(function(connection) {
    console.log('Subscriber connected');

    // send the first chunk immediately
    connection.write(
      '{"type":"changed","file":"targ'
    );

    // after a one second delay, send the other chunk
    let timer = setTimeout(function() {
      connection.write('et.txt","timestamp":1358175758495}' + '\n');
    }, 1000);

    // after a two second delay, write an invalid JSON string
    let timer2 = setTimeout(function() {
      connection.write('[Invalid}\n');
    }, 2000);

    // clear timer when the connection ends
    connection.on('end', function() {
      clearTimeout(timer);
      clearTimeout(timer2);
      console.log('Subscriber disconnected');
    });
  });

server.listen(5432, function() {
  console.log('Test server listening for subscribers...');
});
