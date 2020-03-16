// Note that the following code is copy pasted, then modified from the code 
// from the socket.io official documentation page:
// https://github.com/socketio/socket.io/tree/master/examples/chat
//
//
// Setup basic express server
let express = require('express');
let app = express();
let path = require('path');
let server = require('http').createServer(app);
//var io = require('../..')(server);
let io = require('socket.io')(server)
let port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'frontend')));

// Chatroom

let numUsers = 0;

let myGate = [];
let myWire = [];
let myConnector = [];
let myGateID;
let myConnectorID;

io.on('connection', (socket) => {
  let addedUser = false;


  // when the client emits 'new message', this listens and executes
  socket.on('upload gate', (data) => {
    // we tell the client to execute 'new message'
      console.log("received a gate[]!!!")
      console.log(data)
      myGate = data;
    socket.broadcast.emit('broadcast canvas', {
        gate: myGate, 
        wire: myWire,
        connector: myConnector
    });
  });

  // when the client emits 'new message', this listens and executes
  socket.on('upload wire', (data) => {
    // we tell the client to execute 'new message'
      console.log("received a wire[]!!!")
      console.log(data)
      myWire = data;
    socket.broadcast.emit('broadcast canvas', {
        gate: myGate, 
        wire: myWire,
        connector: myConnector
    });
  });


  // when the client emits 'new message', this listens and executes
  socket.on('upload connector', (data) => {
    // we tell the client to execute 'new message'
      console.log("received a connector[]!!!")
      console.log(data)
      myConnector = data;
    socket.broadcast.emit('broadcast canvas', {
        gate: myGate,
        wire: myWire,
        connector: myConnector
  
    });
  });


  // when the client emits 'new message', this listens and executes
  socket.on('upload canvas', (data1, data2, data3, data4, data5) => {
    // we tell the client to execute 'new message'
      console.log("received a everything to redraw canvas")
      console.log(data1, data2, data3, data4, data5)
      myGate = data1;
      myWire = data2;
      myConnector = data3;
      myGateID = data4
      myGonnectorID = data5
      // myGate = data1;
      // myWire = data2;
      // myConnector = data3;
    socket.broadcast.emit('broadcast canvas', {
        gate: myGate,
        wire: myWire,
        connector: myConnector,
        gateID: myGateID,
        connectorID: myConnectorID
    });
  });


      socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });


  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
