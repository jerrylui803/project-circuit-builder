// Note that the following code is copy pasted, then modified from the code 
// from the socket.io official documentation page:
// https://github.com/socketio/socket.io/tree/master/examples/chat


// Setup basic express server
let express = require('express');
let app = express();
let path = require('path');
let server = require('http').createServer(app);

let io = require('socket.io')(server)
let port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'frontend')));


let myGate = [];
let myWire = [];
let myConnector = [];
let myGateID;
let myConnectorID;

io.on('connection', (socket) => {

  // when the client emits 'upload canvas', this listens and executes
  socket.on('upload canvas', (data1, data2, data3, data4, data5) => {

    // we tell the client to execute
      console.log("received everything to redraw canvas")
      console.log(data1, data2, data3, data4, data5)
      myGate = data1;
      myWire = data2;
      myConnector = data3;
      myGateID = data4
      myConnectorID = data5

    socket.broadcast.emit('broadcast canvas', {
        gate: myGate,
        wire: myWire,
        connector: myConnector,
        gateID: myGateID,
        connectorID: myConnectorID
    });
  });

});
