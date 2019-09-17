const express = require('express');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

var stdin = process.openStdin();




const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log('ws connection')
  const sender = message => {
    console.info('mesage', message)
    ws.send(message)
  }
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  })

  if (PORT === 3000) {
    console.info('LOCAL DEV')
    stdin.addListener("data", function(d) {
      // note:  d is an object, and when converted to a string it will
      // end with a linefeed.  so we (rather crudely) account for that
      // with toString() and then trim()
      console.log("you entered: [" + d.toString().trim() + "]");
      sender(d.toString().trim());
    });
  }
})