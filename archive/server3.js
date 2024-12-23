const net = require('net');
const host = '0.0.0.0';
// const host = "192.168.10.174";
const port = 8090;

const server = net.createServer(async (connection) => {
  let jsonDataString = '';

  console.log(
    'CONNECTED: ' + connection.remoteAddress + ':' + connection.remotePort
  );
});

server.listen(port, host, () => {
  console.log(`TCP Client listening on ${host}:${port}`);
});

// let sockets = [];
// server.on('connection', (socket) => {
//   var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
//   console.log(`new client connected: ${clientAddress}`);

//   sockets.push(socket);

//   socket.once('data', (data) => {
//     console.log(`Client ${clientAddress}: ${data}`);
//     const crypto = require('crypto');
//     const buf = crypto.randomBytes(256);

//   });

//   socket.on('close', (data) => {
//     let index = sockets.findIndex((o) => {
//       return (
//         o.remoteAddress === socket.remoteAddress &&
//         o.remotePort === socket.remotePort
//       );
//     });

//     if (index !== -1) sockets.splice(index, 1);

//     sockets.forEach((sock) => {
//       sock.write(`${clientAddress} disconnected\n`);
//     });

//     console.log(`connection closed: ${clientAddress}`);
//   });

//   socket.on('error', (err) => {
//     console.log(`Error occurred in ${clientAddress}: ${err.message}`);
//   });
// });
