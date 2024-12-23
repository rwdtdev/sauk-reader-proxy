var net = require('net');
const PORT = 8090;
const HOST = '0.0.0.0';

var server = net.createServer(function (connection) {
  console.log(
    'CONNECTED: ' + connection.remoteAddress + ':' + connection.remotePort
  );
  connection.on('data', (data) => {
    jsonDataString = jsonDataString + data.toString();
  });

  connection.on('error', (error) => {
    console.error(error);
    setTimeout(() => {
      server.close();
      server.listen(PORT, HOST);
    }, 30000);
  });
});

server.listen(PORT, HOST);
