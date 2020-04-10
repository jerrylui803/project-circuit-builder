let api = (function(){
    "use strict";
    let module = {};

    let socket = io();


    let currCanvasTitle;
    let currCanvasOwner;




    function send(method, url, data, callback){
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    // TODO_2: so I guess don't need these functions and just use module.uploadCanvas()?
    module.addComponent = function(type,componentID,canvasID,x,y){
        console.log("adding component");
    }

    module.deleteComponent = function(componentID,canvasID){

    }

    module.moveComponent = function(type,componentID,canvasID,x,y){

    }

    module.addWire = function(wireID,startID,endID,canvasID){

    }

    module.deleteWire = function(wireID,canvasID){

    }


    // CANVAS *************************************************************************

    let canvasListeners = [];
    let canvasListListeners = [];
    let signinListeners = [];

    socket.on('broadcast canvas', (data) => {
        console.log("Got a SocketIO broadcase canvas from backend")
        console.log(data)
        console.log()
        notifyCanvasListeners(null, null, data);

    });



    module.signin = function(username, password){
        //console.log("SHOUDL CALL!#!@#!@#!")
        send("POST", "/signin/", {username, password}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifySigninListeners(getUsername());
            notifyCanvasListListeners();
        });
    };

    module.signup = function(username, password){
        console.log("front end log", username, password)
        send("POST", "/signup/", {username, password}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifySigninListeners(getUsername());
        });
    };

    module.signout = function(){
        send("GET", "/signout/", null, function(err, res) {
             if (err) return notifyErrorListeners(err);
             notifySigninListeners(getUsername());
        });
    };



    // add a new canvas to the database
    module.addCanvas = function(title){

        // if (displayGalleryOwner === "") {
        //     displayGalleryOwner = getUsername();
        // }


        send("POST", "/api/canvas/" , {title: title}, function(err, res) {
            if (err) {
                return notifyErrorListeners(err);
            } else {


                notifyCanvasListListeners();
                
                // TODO: now to update canvas listeners?
                // Don't think we need it here, maybe have to server broadcast over socket io?
                // (so that the server triggers notifyImageListeners?)
                
                // notifyImageListeners();
            }
        });
    };



    // add a new canvas to the database
    module.addShareUser = function(targetUsername){

        console.log("TODO: ADD SHARE USER")
        // if (displayGalleryOwner === "") {
        //     displayGalleryOwner = getUsername();
        // }


        // This should only happen if the user edit the front end code by themselves
        if (!currCanvasTitle) {
            console.log("Something went wrong in addShareUser")
        }


        send("POST", "/api/user/share/" , {title: currCanvasTitle, targetUsername: targetUsername}, function(err, res) {
            if (err) {
                console.log("FINISH ADD SHARE USER WENT WRONG")
                return notifyErrorListeners(err);
            } else {

                
                console.log("FINISH ADD SHARE USER")
                // TODO: 
                // maybe broadcast to the user that this canvas is being shared to
                //
                
                // notifyImageListeners();
            }
        });
    };




    let canvasListPage = -1;
    let canvasListPerPage = 3; 



    let getUsername = function(){
        console.log("FFF")
        console.log(document.cookie)
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };


    module.getCurrCanvasTitle = currCanvasTitle;

    module.getCurrCanvasOwner = currCanvasOwner;

    // module.currUserIsCanvasOwner = (currCanvasOwner ===(getUsername()));

    // module.aaa222 = getUsername();
    

    // Get the list of editible canvas for the current user.
    // Then pass this list to myHandler
    // TODO!!!
    let getCanvasList = function(myHandler) {

        let username = getUsername();

        console.log("In getCanvasList!!")
        console.log(username)



        // If user hasn't login
        if (username === "") {
            return myHandler(null, "");
        }


        // get the number of editable canvas for the current user.
        // Backend will determine the username using the cookie, so no need to send username
        send("GET", "/api/size/canvas", null, function(err, res) {


            if (err) {
                return notifyErrorListeners(err);
            }
            let canvasCount = res.size;

            // init canvasListPage 
            if (canvasCount > 0 && canvasListPage === -1) {
                canvasListPage = 0;
            }
            // If there are no editable canvas 
            if (canvasListPage === -1) {
                return myHandler(null, "");
            }
            if (canvasCount != 0) {
                let startIndex = canvasListPage * canvasListPerPage;
                let canvasListLength = canvasListPerPage;
                send("GET", "/api/canvas/title/" + startIndex + "/" + canvasListLength + "/", null, function(err, res) {
                    if (err) {
                        return notifyErrorListeners(err);
                    }

                    let let ret = res;
                    ret[0].left_btn = false;
                    ret[0].right_btn = false;
                    if (startIndex > 0) {
                        ret[0].left_btn = true;
                    }
                    if (startIndex + canvasListPerPage < canvasCount) {
                        ret[0].right_btn = true;
                    }
                    // Note that getUsername() might not be the same user as displayGalleryOwner
                    myHandler(ret, username);
                });
            } else {
                myHandler([], username);
            }
        });




        // send("GET", "/api/size/user/", null, function(err, res) {
        //     if (err) {
        //         return notifyErrorListeners(err);
        //     }
        //     let userCount = res.size;

        //     // init  userPage
        //     if (userCount > 0 && userPage === -1) {
        //         userPage = 0;
        //     }
        //     // If there are no users
        //     if (userPage === -1) {
        //         return myHandler(null, "", "");
        //     }
        //     if (userCount != 0) {
        //         let startIndex = userPage * userPerPage;
        //         let userLength = userPerPage;
        //         send("GET", "/api/user/" + startIndex + "/" + userLength + "/", null, function(err, res) {
        //             if (err) {
        //                 return notifyErrorListeners(err);
        //             }

        //             ret = res;
        //             ret[0].left_btn = false;
        //             ret[0].right_btn = false;
        //             if (startIndex > 0) {
        //                 ret[0].left_btn = true;
        //             }
        //             if (startIndex + userPerPage < userCount) {
        //                 ret[0].right_btn = true;
        //             }
        //             // Note that getUsername() might not be the same user as displayGalleryOwner
        //             myHandler(ret, getUsername(), displayGalleryOwner);
        //         });
        //     } else {
        //         myHandler([], getUsername(), displayGalleryOwner);
        //     }
        // });
    };

    
    // Set module.getUsername as a variable so that index.js can reference its value
    module.getUsername = getUsername;


    module.uploadCanvas = function(all) {
        console.log("uploading canvas state");
        console.log(all);
        //console.log(JSON.stringify(all));
        socket.emit('upload canvas', all);

        // TODO_2: remove this entire function, and replace it with the folling line,
        // where "all" is a string
        // socket.emit('upload canvas', all);
    }

    

    module.switchCanvas = function(owner, title) {
        //let canvas = getCanvasData(owner, title);

        currCanvasTitle = title;
        currCanvasOwner = owner;
        console.log("RUNNING SWITCH CANVAS")
        console.log(currCanvasOwner)

        console.log("in switch canvas")


        //notifyCanvasListeners will fetch the data to update canvas (from the backend)
        notifyCanvasListeners(owner, title, null);

        //
        socket.emit('switch canvas', owner, title);


        //TODO:
        // displayGalleryOwner = galleryOwner;
        // notifyImageListeners();
        // notifyCommentListeners();
        // notifyUserListeners();
    };


    let getCanvasData = function(owner, title, handler) {

        console.log("running getCanvasData")
        console.log(owner, title)
        console.log("running getCanvasData done")

        send("POST", "/api/canvas/data/" + owner + "/" + title + "/", null, function(err, res) { //{owner: owner, title: title} , function(err, res) {
            if (err) {
                return notifyErrorListeners(err);
            }
            // console.log("DONE!!!!!!!!!!!!!!!");
            // console.log(res)
            // console.log(typeof(res))
            // console.log(res.owner)
            // console.log(res.canvas)
            // 
            handler(res.canvas, title, owner);
        });
    }


    // update the canvas itself
    module.onCanvasUpdate = function(handler){
        canvasListeners.push(handler);
    }


    // update the list of editable canvas
    module.onCanvasListUpdate = function(handler){
        //console.log("module.onCanvasListUpdate running")
        canvasListListeners.push(handler);
        // TODO: get the list of canvas list listeners (pagnitaged), and call the handler

        getCanvasList(handler);

    }




    module.onSigninUpdate = function(handler){
        signinListeners.push(handler);
        console.log(getUsername());
        //handler(getUsername());
        //if (displayGalleryOwner === "") {
        //    displayGalleryOwner = getUsername();
        //}
    };


    function notifyCanvasListeners(title, owner, canvas) {
        canvasListeners.forEach(function(listener){
            // if we do not have data to update, then call the api and ask for the data
            if (!canvas && title && owner) {
                getCanvasData(title, owner, listener)
            } else if (canvas && !title && !owner){
                listener(canvas, title, owner)
            } else {
                console.log("SOMETHING WENT WRONG IN notifyCanvasListeners")
            }
            
        });
    }


    function notifyCanvasListListeners() {

        canvasListListeners.forEach(function(listener){
            getCanvasList(listener);
        });
    }



    function notifySigninListeners(){
        signinListeners.forEach(function(listener){
            listener(getUsername());
        });
    }

    // ERRORS ***************************************************************************

    let errorListeners = [];

    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }

    module.onError = function(listener){
        errorListeners.push(listener);
    };





    return module;
})();



