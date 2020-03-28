// Note that the following code is copy pasted, then modified from the code 
// from the socket.io official documentation page:
// https://github.com/socketio/socket.io/tree/master/examples/chat


// Setup basic express server
let express = require('express');
let path = require('path');
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// // Set up mongoose connection
// let mongoose = require('mongoose');
// //let dev_db_url = 'mongodb://someuser:abcd1234@ds123619.mlab.com:23619/productstutorial';
// let dev_db_url = 'mongodb://localhost:27017/test1';
// let mongoDB = process.env.MONGODB_URI || dev_db_url;
// console.log(mongoDB)
// 
// //https://github.com/Automattic/mongoose/issues/8156
// mongoose.connect(mongoDB, {useUnifiedTopology: true, useNewUrlParser: true } );
// mongoose.Promise = global.Promise;
// let db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// 
//    console.log("db object points to the database : "+ mongoose.connections);
let server = require('http').createServer(app);

const session = require('express-session');

const cookie = require('cookie');

var RedisStore = require("connect-redis")(session);




let io = require('socket.io')(server)
let port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'frontend')));


// https://stackoverflow.com/questions/25532692/how-to-share-sessions-with-socket-io-1-x-and-express-4-x
//
// Note that connect-redis is version 3.4.2
// https://github.com/tj/connect-redis/issues/283

let sessionMiddleware = session({
    //store: new RedisStore({}), // XXX redis server config
    secret: "keyboard cat",

     resave: false,
     saveUninitialized: true,

});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});


//  app.use(session({
//      secret: 'the secret is now changed',
//      resave: false,
//      saveUninitialized: true,
//  }));




app.use(sessionMiddleware);

//app.get("/", function(req, res){
//    req.session // Session object in a normal request
//});
//
//io.sockets.on("connection", function(socket) {
//  socket.request.session // Now it's available from Socket.IO sockets too! Win!
//});




const bcrypt = require('bcrypt');

let mongoose = require('mongoose')

// https://www.w3schools.com/nodejs/nodejs_mongodb_insert.asp
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.createCollection("customers", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.createCollection("users", function(err, res) {
        if (err) throw err;
        console.log("Collection users created!");
        dbo.createCollection("diagrams", function(err, res) {
            if (err) throw err;
            console.log("Collection diagrams created!");
            db.close();
        });


    });
});


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = { name: "Company Inc", address: "Highway 37" };
  dbo.collection("customers").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});





let myGate = [];
let myWire = [];
let myConnector = [];
let myGateID;
let myConnectorID;


app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});


// copied from lecture code: CSCC09/lectures/05/src/todo/
app.use(function (req, res, next){
    // Checks whether req.session has the field "user"
    console.log("3333333333333333333333")
    // if (req.session == null) {
    //     req.session = {}
    // }
     console.log(req.session)
    console.log("3333333333333333333333 end")
    req.user = ( 'user' in req.session)? req.session.user : null;
    req.username = (req.user)? req.user._id : '';
    let username = (req.user)? req.user._id : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
        path : '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    next();
});


// copied from lecture code: CSCC09/lectures/05/src/todo/
let isAuthenticated = function(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};



// // copied from lecture code: CSCC09/lectures/05/src/todo/
let isAuthenticatedSocketIO = function(req) {

    // console.log("AAAAAAAAAAAAAAAAA,,,,,,,WTF is req.session null???")
    // console.log(req.session == null)
    req.user = (req.session != null && 'user' in req.session)? req.session.user : null;
    req.username = (req.user)? req.user._id : '';
    let username = (req.user)? req.user._id : '';

    console.log("this is username", req.username)
    if (!req.username) return false;
    else return true;
};




io.on('connection', (socket) => {


    console.log("555555555555555")
    console.log(socket.request.session)
    let isAuthenticatedBool = isAuthenticatedSocketIO(socket.request)
    
    // console.log(" IS THIS A AUTHENICATED USER????")
    // console.log(isAuthenticatedBool)

    // https://stackoverflow.com/questions/33316013/node-js-socket-io-get-cookie-value
   // var cookief =socket.handshake.headers.cookie;
   // var cookies = cookie.parse(socket.handshake.headers.cookie);
   // console.log(cookies);
    console.log("555555555555555 end")

    if (isAuthenticatedBool) {

        // when the client emits 'upload canvas', this listens and executes
        socket.on('upload canvas', (data1, data2, data3, data4, data5) => {

            console.log("THIS IS THE socket ID: ", socket.id);
            // we tell the client to execute
            // console.log("received everything to redraw canvas")
            // console.log(data1, data2, data3, data4, data5)
            myGate = data1;
            myWire = data2;
            myConnector = data3;
            myGateID = data4
            myConnectorID = data5
            let myCanvas = [myGate, myWire, myConnector, myGateID, myConnectorID]; 
            let myCanvasJSON = JSON.stringify(myCanvas);
            console.log(myCanvasJSON)

            socket.broadcast.emit('broadcast canvas', {
                gate: myGate,
                wire: myWire,
                connector: myConnector,
                gateID: myGateID,
                connectorID: myConnectorID
            });
        });
    } else {
        console.log("Unauthenicated user is attempting to connect!")
    }

});




// copied from lecture code: CSCC09/lectures/05/src/todo/
// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
app.post('/signup/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    console.log("here is the username: ", username)

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        let users = dbo.collection("users");

        users.findOne({_id:username}, function(err, user) {
            if (err) throw err;

            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("username " + username + " already exists");

            // generate a new salt and hash
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    // insert new user into the database
                    users.update({_id: username},{_id: username, hash: hash}, {upsert: true}, function(err){

                        if (err) return res.status(500).end(err);

                        // start a session
                        req.session.user = username;

                        // Now login with the newly registered user
                        // retrieve the newly user (json object) from the database
                        users.findOne({_id: username}, function(err, user){

                            // start a session
                            // Note that this is not the same as username
                            // 'user' is an json object of {_id: Bob, hash: abcd1234.....}
                            req.session.user = user;

                            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                                path : '/',
                                maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
                            }));

                            db.close();
                            return res.json("user " + username + " signed up");
                        });
                    });
                });
            });
        });
    });
});



// copied from lecture code: CSCC09/lectures/05/src/todo/
// curl -H "Content-Type: application/json" -X POST -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
app.post('/signin/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        let users = dbo.collection("users");


        // retrieve user from the database
        users.findOne({_id: username}, function(err, user){
            if (err) return res.status(500).end(err);
            if (!user) return res.status(401).end("access denied");

            bcrypt.compare(password, user.hash, function(err, valid) {
                if (err) return res.status(500).end(err);
                if (!valid) return res.status(401).end("access denied");

                // start a session
                req.session.user = user;

                res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
                    path : '/',
                    maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
                }));

                db.close();
                return res.json("user " + username + " signed in");
            });
        });

    });
});



// copied from lecture code: CSCC09/lectures/05/src/todo/
// curl -b cookie.txt -c cookie.txt localhost:3000/signout/
app.get('/signout/', isAuthenticated, function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
        path : '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
});







