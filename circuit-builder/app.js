// Note that the following code is copy pasted, then modified from the code 
// from the socket.io official documentation page:
// https://github.com/socketio/socket.io/tree/master/examples/chat


// Setup basic express server
let express = require('express');
let path = require('path');
let helmet = require('helmet');
let app = express();
let fs = require("fs");
let http = require("http");
let https = require("https");

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// for security
app.use(helmet());


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


const session = require('express-session');

const cookie = require('cookie');

var RedisStore = require("connect-redis")(session);

let port = process.env.PORT || 3000;

let server;
let io;

// SSL Certificate using Let's Encrypt
// execute using npm start on server
if (process.env.NODE_ENV === 'production') {
    console.log("this is production");
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/circuit-builder.me/privkey.pem', 'utf-8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/circuit-builder.me/cert.pem', 'utf-8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/circuit-builder.me/chain.pem', 'utf-8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    // HTTPS connection
    server = https.createServer(credentials, app).listen(port=443, () => {
        console.log('HTTPS Server running on port 443');
    });

    // Re-direct HTTP connection to HTTPS
    http.createServer(function(req, res) {
        res.writeHead(301, {"Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(port=80);

    io = require('socket.io')(server)

    // execute using node app.js for dev work
} else {
    console.log("this is development");

    server = require('http').createServer(app);

    server.listen(port, () => {
        console.log('Server listening at port %d', port);
    });

    io = require('socket.io')(server)
}



//app.set("socketio", io)

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


// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("mydb");
//     dbo.createCollection("customers", function(err, res) {
//         if (err) throw err;
//         console.log("Collection created!");
//         db.close();
//     });
// });


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.createCollection("users", function(err, res) {
        if (err) throw err;
        console.log("Collection users created!");
        dbo.createCollection("diagrams", function(err, res) {
            if (err) throw err;
            console.log("Collection diagrams created!");

            dbo.createCollection("diagramShare", function(err, res) {
                if (err) throw err;
                console.log("Collection diagramShare created!");
                db.close();
            });



        });


    });
});


// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("mydb");
//     var myobj = { name: "Company Inc", address: "Highway 37" };
//     dbo.collection("customers").insertOne(myobj, function(err, res) {
//         if (err) throw err;
//         console.log("1 document inserted");
//         db.close();
//     });
// });





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



// If user is not authenticated, then return null,
// if user is authenticated, then return the username
let isAuthenticatedSocketIO = function(req) {

    req.user = (req.session != null && 'user' in req.session)? req.session.user : null;
    req.username = (req.user)? req.user._id : '';
    let username = (req.user)? req.user._id : '';

    console.log("this is username", req.username)
    return (req.username)
    // if (!req.username) return false;
    // else return true;
};




let Diagram = function(username, title, canvas) {
    this.owner = username;
    this.title = title;
    this.canvas = canvas;
};

// the canvas titled 'title' owned by 'owner' is being shared with 'username'
let Share = function(owner, title, shareUsername) {
    this.owner = owner;
    this.title = title;
    this.shareUsername = shareUsername;
};





// https://stackoverflow.com/questions/35385609/random-chat-with-two-users-at-a-time-socket-io
// TODO:
let rooms = {};    // map socket.id => room
let names = {};    // map socket.id => name
let allUsers = {}; // map socket.id => socket


io.on('connection', (socket) => {


    //console.log("555555555555555")
    //console.log(socket.request.session)
    let username = isAuthenticatedSocketIO(socket.request)

    // console.log(" IS THIS A AUTHENICATED USER????")
    // console.log(isAuthenticatedBool)

    // https://stackoverflow.com/questions/33316013/node-js-socket-io-get-cookie-value
    // var cookief =socket.handshake.headers.cookie;
    // var cookies = cookie.parse(socket.handshake.headers.cookie);
    // console.log(cookies);

    if (username) {

        // when the client emits 'upload canvas', this listens and executes
        socket.on('upload canvas', (myCanvas) => {
            console.log(names)
            console.log(username)
            console.log(socket.id)

            //sanity check
            if (names[socket.id] == null || !(names[socket.id] === username)) {
                console.log("something went wrong in socketio upload canvas")
                return;
            }

            let room = rooms[socket.id]

            if (!room) {
                console.log("something went wrong. this user hasn't select which canvas to update (this should not be possible)")
                return;
            }
            console.log("In upload canvas: here is the canvas received: (as a string)");
            console.log(typeof(myCanvas));
            console.log(myCanvas);

            let roomInfo = room.split('#');

            owner = roomInfo[0];
            title = roomInfo[1];

            //Mouse action, do not query database or make connection.
            if(myCanvas.action != "ADD"){
                socket.broadcast.to(room).emit('broadcast canvas', myCanvas);
                return;
            }
            // No need to do additional checks for whether this user is allowed to modify this canvas or not,
            // because we have the socketID

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                let dbo = db.db("mydb");
                let diagrams = dbo.collection("diagrams");


                // store this update to the canvas into the database
                // diagrams.update({owner: owner, title: title},{owner: owner, title: title, canvas: myCanvas}, function(err){
                //
                // diagrams.update({owner: owner, title: title},{ canvas: "AAAAAAAAAA"}, function(err){
                diagrams.findOne({owner: owner, title: title}, function(err, item){

                    if (err) {
                        console.log(err);
                        io.to(socket.id).emit(err);
                    }
                    // console.log("WHY IS IT NULL")
                    // console.log(owner)
                    // console.log(title)
                    // console.log(item)

                    
                    console.log("saving canvas");
                    item['canvas'] = myCanvas.object;
                    
                    // Save the item with the additional field
                    diagrams.save(item, {w: 1}, function(err, result) {

                        if (err) {
                            console.log(err);
                            io.to(socket.id).emit(err);
                        }
                        // Now tell everyone in this room to update their canvas
                        socket.broadcast.to(room).emit('broadcast canvas', myCanvas);

                    });
                    



                });
            });
        });


        console.log("does it wait?")

        socket.on('switch canvas', (owner, title) => {

            console.log("SOCKET SWITCH CANVAS IS NOT IMPLEMENTED")

            //TODO: IMPLEMENT THIS 


            // We need to check the relationship between 'username', 'owner' and 'title'
            // username and owner might not be the same!
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                let dbo = db.db("mydb");

                // TODO: First check if this user (base on cookie) is authorized to access this canvas or not
                let diagramShare = dbo.collection("diagramShare");

                diagramShare.findOne({title: title, owner: owner, shareUsername: username}, function(err, shareWith){
                    // if (err) return res.status(500).end(err);
                    if (err) {
                        console.log(err);
                        io.to(socket.id).emit(err);
                    }

                    if (shareWith) {
                        // This user is allow to switch to this canvas, record the socket id,
                        // and send future updates to this canvas to this user 

                        // First check if this user was in some other room. If so, then remove this 
                        // user from the previous room first
                        if (rooms[socket.id]) {

                            if (!allUsers[socket.id]) {
                                console.log("SOMETHING WENT WRONG!!! THIS USER JOINED A ROOM BUT WE DONT KNOW THE USERNAME")
                            }

                            let prevRoom = rooms[socket.id];
                            socket.leave(prevRoom);

                            // clean up (even though we are over writing immediately after)
                            rooms[socket.id] = null;
                            allUsers[socket.id] = null;
                        }


                        names[socket.id] = username;

                        // TODO: add check to owner and title that it cannot contain the special character '#'
                        allUsers[socket.id] = socket;
                        let room = owner + '#' + title;
                        socket.join(room);
                        // register rooms to their names
                        rooms[socket.id] = room;


                        let diagrams = dbo.collection("diagrams");

                        diagrams.findOne({owner: owner , title: title}, {canvas :1}, function(err, diagram) {
                            if (err) throw err;
                            else {
                                console.log("Found the canvas , about to return the canvas through socketio, logging the canvas(string)")
                                console.log(owner)
                                console.log(title)
                                console.log(diagram)
                                io.to(socket.id).emit(diagram.canvas);
                            }
                        })

                    } else {
                        // return res.status(500).end("access denied. You are not allowed to switch to this canvas");
                        console.log("access denied. You are not allowed to switch to this canvas");
                        io.to(socket.id).emit("access denied. You are not allowed to switch to this canvas");
                    }
                });

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



// new canvas
// The owner of the canvas is automatically determined based on the cookie
app.post('/api/canvas/', isAuthenticated, function (req, res, next) {
    console.log("THIS IS THE USERNAME OF THE USER WHO MADE A NEW CANVAS")
    console.log(req.user._id);
    console.log(req.body.title)

    let username = req.user._id;
    let title = req.body.title;
    console.log("debug log 222")
    console.log(username)
    console.log(title)

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");

        diagrams.findOne({owner: username , title: title}, function(err, diagram) {
            if (err) throw err;
            if (diagram) return res.status(409).end("username " + username + " already has a diagram titled " + title + ".");
            else {

                diagrams.insertOne(new Diagram(username, title, ""), function (err, item) {
                    if (err) return res.status(500).end(err);


                    let diagramShare = dbo.collection("diagramShare");

                    diagramShare.insertOne(new Share(username, title, username), function (err, item) {
                        console.log("WE ARE DONE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                        console.log(err)
                        if (err) return res.status(500).end(err);
                        else return res.json("title " + username + " created");
                    });

                    // console.log('broast cast   1')
                    // TODO: The following does not work!!! Only broadcast1 gets printed
                    //
                    // io.on('connection', (socket) => {
                    //     console.log('broast cast   2')
                    //     socket.broadcast.emit('broadcast canvas', {
                    //         gate: null, 
                    //         wire: null,
                    //         connector: null,
                    //         gateID: null,
                    //         connectorID: null
                    //     });
                    //     console.log('broast cast   1')
                    // });
                    // return res.json(req.body);

                });
            }
        });
    });

    // images.insert(new Image(req.body, req.user._id, req.file), function (err, item) {
    //     if (err) return res.status(500).end(err);
    //     return res.json(req.body);
    // });
});



// return the total number of editable canvas for the current user
//
// use the username from the cookie, so no need to explicitely pass the username when
// using this api
app.get('/api/size/canvas', isAuthenticated, function (req, res, next) {
    let username = req.user._id;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");

        dbo.collection('diagramShare').aggregate([
            {$match:
                {'shareUsername': username}
            },
            { $lookup:
                {
                    from: "diagrams",
                    let: { myTitle: "$title", myOwner: "$owner"},
                    pipeline: [
                        { $match:
                            { $expr:
                                { $and:
                                    [
                                        { $eq: [ "$title", "$$myTitle"] },
                                        { $eq: [ "$owner", "$$myOwner" ] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "temp"
                }
            }
            ,
            { $project: { "title": 1, "owner": 1, _id: 0 }},
            { $count: "myCount"}

        ]).toArray(function(err, count) {
            console.log("printing in size function")
            console.log(count)

            if (err) {
                return res.status(500).end(err);
            } else {
                if (count[0]) {
                    return res.json({size: (count[0]).myCount});
                } else {
                    return res.json({size: 0})
                }
            }

        });

        // diagrams.count({owner: username}, function(err, count) {
        //     if (err) {
        //         return res.status(500).end(err);
        //     } else {
        //         return res.json({size: (count)});
        //     }
        // });
    });
});



// get several canvas titles
// Start from the 'startIndex'-th canvas, and return total of 'canvasLength' number of canvas
app.get('/api/canvas/title/:startIndex/:canvasLength', isAuthenticated, function (req, res, next) {
    let username = req.user._id;
    let startIndex = parseInt(req.params.startIndex);
    let canvasLength = parseInt(req.params.canvasLength);

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");
        let diagramShare = dbo.collection("diagramShare");


        //TODO: might need to also store insert time stampt
        //

        // diagrams.find({username: username}, {hash:0, createdAt:0, updatedAt:0}).sort(
        //     {createdAt:1}).skip(startIndex).limit(canvasLength).exec(function(err, canvas) {
        //
        //


        console.log("test1")




        // https://kb.objectrocket.com/mongo-db/how-to-use-the-lookup-function-in-mongodb-1277

        dbo.collection('diagramShare').aggregate([
            {$match:
                {'shareUsername': username}
            },
            { $lookup:
                {
                    from: "diagrams",
                    let: { myTitle: "$title", myOwner: "$owner"},
                    pipeline: [
                        { $match:
                            { $expr:
                                { $and:
                                    [
                                        { $eq: [ "$title", "$$myTitle"] },
                                        { $eq: [ "$owner", "$$myOwner" ] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "temp"
                }
            }
            ,
            { $sort : { owner : 1, title: 1 }},
            { $skip : startIndex },
            { $limit: canvasLength},
            { $project: { "title": 1, "owner": 1, _id: 0 }}
        ]).toArray(function(err, canvasList) {
            // console.log("CHECK THIS")
            // console.log(typeof(canvasList[0].temp))
            // console.log(canvasList)

            if (err) return res.status(500).end(err);
            return res.json(canvasList)
        });


        // dbo.collection('diagrams').aggregate([
        //     { $lookup:
        //         {
        //             from: 'diagramShare',
        //             localField: 'shareUsername',
        //             foreignField: 'owner',
        //             as: 'owner222'
        //         }
        //     }, 
        //     { $lookup:
        //         {
        //             from: 'diagramShare',
        //             localField: 'title',
        //             foreignField: 'title',
        //             as: 'title222'
        //         }
        //     }

        // ]).toArray(function(err, res) {
        //     console.log("CHECK THIS")
        //     console.log(res)
        //     console.log((res[0]).title222)
        //     console.log((res[0]).owner222)

        // });


        //  diagrams.find().sort({"created_at":1}).skip(startIndex).limit(canvasLength).project({title:1, owner:1, _id:0}).toArray( function(err, canvas){
        //      if (err) return res.status(500).end(err);
        //      //console.log(canvas);
        //      return res.json(canvas)
        //  });

    });
});







// get data for a canvas base on owner and title
// Also check if the user is authorized to view this canvas
app.post('/api/canvas/data/:owner/:title', isAuthenticated, function (req, res, next) {
    let username = req.user._id;
    // let owner = req.body.owner;
    // let title = req.body.title;
    let owner = (req.params.owner);
    let title = (req.params.title);

    console.log("logging in /api/canvas/data/owner/title")
    console.log(owner)
    console.log(title)


    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");


        diagrams.findOne({title: title, owner: owner}, function(err, canvas){
            if (err) return res.status(500).end(err);
            console.log(canvas);
            //
            // TODO: First check if this user (base on cookie) is authorized to access this canvas or not

            let diagramShare = dbo.collection("diagramShare");

            diagramShare.findOne({title: title, owner: owner, shareUsername: username}, function(err, shareWith){
                if (err) return res.status(500).end(err);
                if (shareWith) {
                    console.log("ASDIHOASDHASIO(DHASOID:")
                    console.log(canvas.canvas)
                    return res.json(canvas.canvas)
                } else {
                    return res.status(500).end("access denied");
                }
            });



            // return res.json(canvas)
        });

    });

});






app.post('/api/user/share/', isAuthenticated, function (req, res, next) {


    let username = req.user._id;
    let title = req.body.title;
    let targetUsername = req.body.targetUsername;


    console.log("logging info in /api/user/share/, here is the username, title, and the targetUsername")
    console.log(username)
    console.log(title)
    console.log(targetUsername)




    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");

        // First make sure this user actually is the owner of the canvas that is about to be shared
        // This will always be true if the user doesn't edit the frontend by themselves
        diagrams.findOne({owner: username , title: title}, function(err, diagram) {

            if (err) return res.status(500).end(err);

            if (diagram) {

                let diagramShare = dbo.collection("diagramShare");


                diagramShare.insertOne(new Share(username, title, targetUsername), function (err, item) {
                    console.log(err)
                    console.log(item)
                    console.log("ALL DONE !!!!!!!!!!!!!!!!!!!")

                    if (err) return res.status(500).end(err);


                });


            }
            else {
                console.log("WHY CAN't I FIND TI?????????")
            }
        });
    });

    // images.insert(new Image(req.body, req.user._id, req.file), function (err, item) {
    //     if (err) return res.status(500).end(err);
    //     return res.json(req.body);
    // });
});




