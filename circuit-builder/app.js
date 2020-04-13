

// Setup basic express server
const express = require('express');
const app = express();

// Other dependencies
const path = require('path');
const fs = require("fs");
const http = require("http");
const https = require("https");


// for parsing
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// for security
const validator = require('validator');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
app.use(helmet());

const session = require('express-session');
const cookie = require('cookie');

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

} else {
    // execute using node app.js for dev work
 
    console.log("this is development");

    server = require('http').createServer(app);

    server.listen(port, () => {
        console.log('Server listening at port %d', port);
    });

    io = require('socket.io')(server)
}


// Routing
app.use(express.static(path.join(__dirname, 'frontend')));

let sessionMiddleware = session({
    secret: "This is a secret that is used by circuit builder app :)",
    resave: false,
    saveUninitialized: true,
    // https://expressjs.com/en/advanced/best-practice-security.html
    cookie: {
        httpOnly: true,
        secure: true, // remove secure flag in localhost
        sameSite: true
    }
});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);


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
    let dbo = db.db("mydb");
    // dbo.dropDatabase();
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


MongoClient.connect(url, function(err, db) {

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
            maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
            sameSite: true
        }));
        next();
    });

    // copied from lecture code: CSCC09/lectures/05/src/todo/
    let isAuthenticated = function(req, res, next) {
        if (!req.username) return res.status(401).end("Access denied");
        next();
    };

    // If user is not authenticated, then return null,
    // if user is authenticated, then return the username
    let isAuthenticatedSocketIO = function(req) {
        req.user = (req.session != null && 'user' in req.session)? req.session.user : null;
        req.username = (req.user)? req.user._id : '';
        return (req.username)
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

    // Sanitization
    let checkUsername = function(req, res, next) {
        if (!validator.isAlphanumeric(req.body.username)) return res.status(400).end("username must contain only alpha-numeric characters.");
        next();
    };

    let checkOwner = function(req, res, next) {
        if (!validator.isAlphanumeric(req.params.owner)) return res.status(400).end("owner must contain only alpha-numeric characters.");
        next();
    };

    let checkTargetUsername = function(req, res, next) {
        if (!validator.isAlphanumeric(req.body.targetUsername)) return res.status(400).end("target username must contain only alpha-numeric characters.");
        next();
    };

    let checkShareUsername = function(req, res, next) {
        if (!validator.isAlphanumeric(req.params.shareUsername)) return res.status(400).end("share username must contain only alpha-numeric characters.");
        next();
    };

    let checkTitleBody = function(req, res, next) {
        if (!validator.isAlphanumeric(req.body.title)) return res.status(400).end("title must contain only alpha-numeric characters.");
        next();
    };

    let checkTitleParams = function(req, res, next) {
        if (!validator.isAlphanumeric(req.params.title)) return res.status(400).end("title must contain only alpha-numeric characters.");
        next();
    };

    // https://stackoverflow.com/questions/35385609/random-chat-with-two-users-at-a-time-socket-io
    let rooms = {};    // map socket.id => room
    let names = {};    // map socket.id => name
    let allUsers = {}; // map socket.id => socket
    let socketIds = {} // map name      => socket.id  (this is for removing a user)

    // https://github.com/socketio/socket.io/tree/master/examples/chat
    io.on('connection', (socket) => {

        let username = isAuthenticatedSocketIO(socket.request)

        if (username) {

            // when the client emits 'upload canvas', this listens and executes
            socket.on('upload canvas', (myCanvas) => {

                if (names[socket.id] == null || !(names[socket.id] === username)) {
                    // impossible unless the user modify the frontend and try to crash the server
                    console.log("Something went wrong in socketio upload canvas.")
                    return;
                }

                let room = rooms[socket.id]
                if (!room) {
                    // this is possible -    if the user deleted a canvas but socket id hasn't been updated
                    //                    or if the user just got removed from a canvas that he/she used to have access to
                    console.log("This user hasn't select which canvas to update.")
                    return;
                }

                let roomInfo = room.split('#');

                owner = roomInfo[0];
                title = roomInfo[1];

                // Mouse action, do not query database or make connection.
                if (myCanvas.action != "ADD"){
                    socket.broadcast.to(room).emit('broadcast canvas', myCanvas);
                    return;
                }

                // No need to do additional checks for whether this user is allowed to modify this canvas or not
                // because we have the socketID.

                let dbo = db.db("mydb");
                let diagrams = dbo.collection("diagrams");

                // store this update to the canvas into the database
                diagrams.findOne({owner: owner, title: title}, function(err, item){

                    if (err) {
                        io.to(socket.id).emit(err);
                    }

                    if (!item) {
                        // This item might have been deleted already, remove this socketid from pointing
                        // to this item
                        delete rooms[socket.id];
                        // Then of course no updating needed since no such item
                        return;
                    }

                    item['canvas'] = myCanvas.object;

                    // Save the item with the additional field
                    diagrams.save(item, {w: 1}, function(err, result) {

                        if (err) {
                            io.to(socket.id).emit(err);
                        }
                        // Now tell everyone in this room to update their canvas
                        socket.broadcast.to(room).emit('broadcast canvas', myCanvas);
                    });
                });
            });


            socket.on('switch canvas', (owner, title) => {

                if (!validator.isAlphanumeric(owner) || !validator.isAlphanumeric(title)) {
                    io.to(socket.id).emit("Owner and title must contain only alpha-numeric characters.");
                }

                // We need to check the relationship between 'username', 'owner' and 'title'
                // username and owner might not be the same!

                let dbo = db.db("mydb");

                let diagramShare = dbo.collection("diagramShare");

                diagramShare.findOne({title: title, owner: owner, shareUsername: username}, function(err, shareWith){
                    if (err) {
                        io.to(socket.id).emit(err);
                    }
                    if (shareWith) {
                        // This user is allow to switch to this canvas, record the socket id,
                        // and send future updates to this canvas to this user 

                        // First check if this user was in some other room. If so, then remove this 
                        // user from the previous room first
                        if (rooms[socket.id]) {

                            if (!allUsers[socket.id]) {
                                // impossible unless the user modify the frontend and try to crash the server
                                console.log("Something went wrong in socketio upload canvas.")
                            }

                            let prevRoom = rooms[socket.id];
                            socket.leave(prevRoom);

                            // good practice to clean up first
                            rooms[socket.id] = null;
                            allUsers[socket.id] = null;
                        }

                        names[socket.id] = username;
                        socketIds[username] = socket.id;

                        // owner and title won't contain '#', because we already checked that it is alpha-numeric
                        allUsers[socket.id] = socket;
                        let room = owner + '#' + title;
                        socket.join(room);
                        // register rooms to their names
                        rooms[socket.id] = room;

                        let diagrams = dbo.collection("diagrams");
                        diagrams.findOne({owner: owner , title: title}, {canvas :1}, function(err, diagram) {
                            if (err) throw err;
                            else {
                                if (!diagram) {
                                    // This item might have been deleted already, remove this socketid from pointing
                                    // to this item
                                   
                                    // No more updates to this room
                                    delete rooms[socket.id];
                                    
                                    // No more updates from this room
                                    socket.leave(room);
                                    return;
                                }
                                io.to(socket.id).emit(diagram.canvas);
                            }
                        });

                    } else {
                        io.to(socket.id).emit("Access denied. You are not allowed to switch to this canvas");
                    }
                });

            });
        } else {
            io.to(socket.id).emit("Access denied. Unauthenicated user.");
        }
    });


    // copied from lecture code: CSCC09/lectures/05/src/todo/
    app.post('/signup/', checkUsername, function (req, res, next) {
        let username = req.body.username;
        let password = req.body.password;

        if (err) throw err;
        let dbo = db.db("mydb");
        let users = dbo.collection("users");

        users.findOne({_id:username}, function(err, user) {

            if (err) return res.status(500).end(err);
            if (user) return res.status(409).end("username " + username + " already exists");

            if (username == '' || password == '') return res.status(400).end("Both username and password need to be non-empty");

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

                            return res.json("user " + username + " signed up");
                        });
                    });
                });
            });
        });
    });

 
    // copied from lecture code: CSCC09/lectures/05/src/todo/
    app.post('/signin/', checkUsername, function (req, res, next) {
        let username = req.body.username;
        let password = req.body.password;

        if (err) throw err;
        let dbo = db.db("mydb");
        let users = dbo.collection("users");

        // retrieve user from the database
        users.findOne({_id: username}, function(err, user){
            if (err) return res.status(500).end(err);
            if (!user) return res.status(401).end("Access denied");

            bcrypt.compare(password, user.hash, function(err, valid) {
                if (err) return res.status(500).end(err);
                if (!valid) return res.status(401).end("Access denied");

                // start a session
                req.session.user = user;

                res.setHeader('Set-Cookie', cookie.serialize('username', user._id, {
                    path : '/',
                    maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
                }));
                return res.json("user " + username + " signed in");
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
    app.post('/api/canvas/', isAuthenticated, checkTitleBody, function (req, res, next) {

        let username = req.user._id;
        let title = req.body.title;

        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");

        diagrams.findOne({owner: username , title: title}, function(err, diagram) {
            if (err) throw err;
            if (diagram) return res.status(409).end("username " + username + " already has a diagram titled " + title + ".");
            else {
                diagrams.insertOne(new Diagram(username, title, {"connHandler":{"connectors":[]},"wireHandler":{"wires":[]},"gateHandler":{"gates":[]},"portHandler":{"ports":[]}}), function (err, item) {
                    if (err) return res.status(500).end(err);
                    let diagramShare = dbo.collection("diagramShare");
                    diagramShare.insertOne(new Share(username, title, username), function (err, item) {
                        if (err) return res.status(500).end(err);
                        else return res.json("title " + title + " created");
                    });
                });
            }
        });
    });

    // return the total number of editable canvas for the current user
    //
    // use the username from the cookie, so no need to explicitely pass the username when
    // using this api
    app.get('/api/size/canvas', isAuthenticated, function (req, res, next) {
        let username = req.user._id;
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
                    as: "shared_attribute"
                }
            },
            { $project: { "title": 1, "owner": 1, _id: 0 }},
            { $count: "myCount"}
        ]).toArray(function(err, count) {
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
    });


    // get several canvas titles
    // Start from the 'startIndex'-th canvas, and return total of 'canvasLength' number of canvas
    app.get('/api/canvas/title/:startIndex/:canvasLength', isAuthenticated, function (req, res, next) {
        let username = req.user._id;
        let startIndex = parseInt(req.params.startIndex);
        let canvasLength = parseInt(req.params.canvasLength);

        // check if startIndex and canvasLength are integers
        if (!Number.isInteger(startIndex) || !Number.isInteger(canvasLength)) {
            return res.status(400).end("Please enter startIndex and canvasLength as integers.");
        };

        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");
        let diagramShare = dbo.collection("diagramShare");

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
                    as: "shared_attribute"
                }
            },
            { $sort : { owner : 1, title: 1 }},
            { $skip : startIndex },
            { $limit: canvasLength},
            { $project: { "title": 1, "owner": 1, _id: 0 }}
        ]).toArray(function(err, canvasList) {
            if (err) return res.status(500).end(err);
            return res.json(canvasList)
        });
    });


    // return the total number of shared users for a given canvas
    //
    // use the username from the cookie, so no need to explicitely pass the username when
    // using this api
    app.post('/api/size/share', isAuthenticated, checkTitleBody, function (req, res, next) {
        let username = req.user._id;
        let title = (req.body.title);

        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");

        dbo.collection('diagramShare').aggregate([
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
                                        { $eq: [ "$owner", "$$myOwner"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "shared_attribute"
                }
            },
            { $match :
                { owner: username, title: title}
            },
            { $match : 
                {
                    'shareUsername': {
                        $nin: [ username ]
                    }
                }
            }
            ,
            { $project: { "title": 1, "owner": 1, "shareUsername" :1, _id: 0 }},
            { $count: "myCount"}

        ]).toArray(function(err, count) {
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
    });


    // get several shared usernames who has can edit the current canvas
    // Start from the 'startIndex'-th canvas, and return total of 'userLength' number of canvas
    app.post('/api/user/unshare/:startIndex/:userLength', isAuthenticated, function (req, res, next) {
        let username = req.user._id;
        let startIndex = parseInt(req.params.startIndex);
        let userLength = parseInt(req.params.userLength);

        // check if startIndex and userLength are integers
        if (!Number.isInteger(startIndex) || !Number.isInteger(userLength)) {
            return res.status(400).end("Please enter startIndex and userLength as integers.");
        };

        let title = (req.body.title);

        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");
        let diagramShare = dbo.collection("diagramShare");

        // https://kb.objectrocket.com/mongo-db/how-to-use-the-lookup-function-in-mongodb-1277
        dbo.collection('diagramShare').aggregate([
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
            },
            { $match : 
                { owner: username, title: title},
            },
            { $match : 
                {
                    'shareUsername': {
                        $nin: [ username ]
                    }
                }
            },
            { $sort : { owner : 1, title: 1 }},
            { $skip : startIndex },
            { $limit: userLength},
            { $project: { "title": 1, "owner": 1, "shareUsername": 1, _id: 0 }}
        ]).toArray(function(err, canvasList) {
            if (err) return res.status(500).end(err);
            return res.json(canvasList)
        });

    });


    app.delete('/api/canvas/data/:title', isAuthenticated, checkTitleParams, function(req, res, next) {
        let owner = req.user._id;
        let title = (req.params.title);

        let dbo = db.db('mydb');
        let diagrams = dbo.collection("diagrams");
        let diagramShare = dbo.collection("diagramShare");

        diagrams.findOne({title: title, owner: owner}, function(err, canvas){
            // if diagram does not exist
            if (!canvas) return res.status(404).end("the diagram does not exist");

            // delete the diagram
            diagrams.deleteOne({title: title, owner: owner}, function(err, canvas1) {
                if (err) throw err;

                // also delete all associated diagram shares if it exists
                diagramShare.deleteMany({title: {$in: [title]}, owner: {$in: [owner]}}, function(err, canvas2) {
                    if (err) throw err;
                    return res.json(canvas)
                });
            });
        });
    });


    app.delete('/api/canvas/unshare/:title/:shareUsername', isAuthenticated, checkTitleParams, checkShareUsername, function(req, res, next) {
        let owner = req.user._id;
        let title = (req.params.title);
        let shareUsername = (req.params.shareUsername);

        let dbo = db.db('mydb');
        let diagrams = dbo.collection("diagrams");
        let diagramShare = dbo.collection("diagramShare");

        diagramShare.findOne({title: title, owner: owner, shareUsername}, function(err, canvas){
            if (err) throw err;
            // if diagram does not exist
            if (!canvas) return res.status(404).end("the diagram does not exist");

            // delete the diagram
            diagramShare.deleteOne({title: title, owner: owner, shareUsername: shareUsername}, function(err, canvas1) {
                if (err) throw err;

                // We have now removed the user from the shareDiagram database

                // Now if this user is already editing the diagram (through socketio), then we
                // need to remove this user immediately
                let shareUserSocketID = socketIds[shareUsername]
                let prevRoom = rooms[shareUserSocketID]

                // This user can no longer write to the canvas
                delete rooms[shareUserSocketID];

                // This user can no longer receive updates to this canvas
                let shareUserSocket = allUsers[shareUserSocketID];
                if (shareUserSocket) {
                    shareUserSocket.leave(prevRoom);
                }

                return res.json(canvas)
            });
        });
    });


    // get data for a canvas base on owner and title
    // Also check if the user is authorized to view this canvas
    app.post('/api/canvas/data/:owner/:title', isAuthenticated, checkOwner, checkTitleParams, function (req, res, next) {
        let username = req.user._id;
        let owner = (req.params.owner);
        let title = (req.params.title);

        if (err) throw err;
        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");

        diagrams.findOne({title: title, owner: owner}, function(err, canvas){
            if (err) return res.status(500).end(err);

            let diagramShare = dbo.collection("diagramShare");

            diagramShare.findOne({title: title, owner: owner, shareUsername: username}, function(err, shareWith){
                if (err) return res.status(500).end(err);
                if (shareWith) {
                    if (canvas.canvas) {
                        return res.json(canvas.canvas)
                    } else {
                        return res.json("This canvas does not exist")
                    }
                } else {
                    return res.status(401).end("Access denied");
                }
            });
        });
    });


    // Add this user to shared user
    app.post('/api/user/share/', isAuthenticated, checkTitleBody, checkTargetUsername, function (req, res, next) {
        let username = req.user._id;
        let title = req.body.title;
        let targetUsername = req.body.targetUsername;

        let dbo = db.db("mydb");
        let diagrams = dbo.collection("diagrams");
        let users = dbo.collection("users");

        users.findOne({_id:targetUsername}, function(err, user) {

            if (err) return res.status(500).end(err);
            if (!user) return res.json("username " + username + " does not exist");

            // First make sure this user actually is the owner of the canvas that is about to be shared
            // This will always be true if the user doesn't edit the frontend by themselves
            diagrams.findOne({owner: username , title: title}, function(err, diagram) {

                if (err) return res.status(500).end(err);
                if (diagram) {

                    let diagramShare = dbo.collection("diagramShare");

                    diagramShare.findOne({owner: username , title: title, shareUsername: targetUsername}, function(err, myItem) {
                        if (myItem) {
                            return res.json("This diagram is already being shared to this user.")
                        } else {
                            diagramShare.insertOne(new Share(username, title, targetUsername), function (err, item) {
                                if (err) return res.status(500).end(err);
                                else return res.json(item)
                            });
                        }
                    });


                } else {
                    return res.json("the diagram does not exist");
                }
            });
        });
    });
});

