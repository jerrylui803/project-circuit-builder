let api = (function(){
    "use strict";
    let module = {};

    let socket = io();


    let currCanvasTitle;
    let currCanvasOwner;


    //console.log("API JS IS RELOADED!@#)_!@(#_)!@UFJANOISDJASOIDJAPSIODJAPOSDJOPAISDJOPAIDA")


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
    module.addComponent = function(component){

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
    let unshareListListeners = [];
    let signinListeners = [];

    socket.on('broadcast canvas', (data) => {
        // console.log("Got a SocketIO broadcase canvas from backend")
        // console.log(data)
        // console.log()
        notifyCanvasListeners(null, null, data);

    });



    module.signin = function(username, password){
        //console.log("SHOUDL CALL!#!@#!@#!")
        send("POST", "/signin/", {username, password}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifySigninListeners(getUsername());
            notifyCanvasListListeners();
            // notifyUnshareListListeners();
        });
    };

    module.signup = function(username, password){
        console.log("front end log", username, password)
        send("POST", "/signup/", {username, password}, function(err, res){
            console.log("AKLDHSFKLASDHLKAJSDLASKHDALSKJHLAKSHDLKASDLKJASHD")
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

        console.log("ADD TGHE FUCKING CANVASA")

        send("POST", "/api/canvas/" , {title: title}, function(err, res) {
            if (err) {
                console.log("GOT AN ERROR")
                console.log(err)
                return notifyErrorListeners(err);
            } else {

                console.log("Finished sending a new title")

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

                notifyUnshareListListeners();

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


    let unshareListPage = -1;
    let unshareListPerPage = 3; 

    let getUsername = function(){
        console.log("FFF")
        console.log(document.cookie)
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };

    module.getCurrTitle = function() {
        return currCanvasTitle;
    }

    module.getCurrOwner = function() {
        return currCanvasOwner;
    }


    // module.getCurrCanvasTitle = currCanvasTitle;

    // module.getCurrCanvasOwner = currCanvasOwner;

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
            console.log("LOGGING COUNT")
            console.log(canvasCount)

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


                    let ret = res;
                    console.log("Logging the result from getting all the canvas titles")
                    console.log(ret)
                    console.log(ret)
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

    };




        // Get the list of editible canvas for the current user.
        // Then pass this list to myHandler
        // TODO!!!
    let getUnshareList = function(myHandler) {
        console.log("GET UNSHARE LIST IS NOT IMPEMENTED")

        let username = getUsername();

        console.log("In getUnshareList!!")
        console.log(username)
        console.log(currCanvasOwner)


        // If user hasn't login or is not the owner of the current display canvas
        if (username === "" || username != currCanvasOwner) {
            console.log("FAIL 1")
            return myHandler(null, "");
        }

        // get the number of shared users who can edit the current canvas
        // Backend will determine the username using the cookie, so no need to send username. 
        // (but do need to send the title)
        //
        // A user can only check the number of shared users of his/her own titles

        send("POST", "/api/size/share", {title: currCanvasTitle}, function(err, res) {

            if (err) {
                return notifyErrorListeners(err);
            }
            let userCount = res.size;
            console.log("LOGGING COUNT in the unshare list ")
            console.log(userCount)

            // return;

            // init unshareListPage 
            if (userCount > 0 && unshareListPage === -1) {
                unshareListPage = 0;
            }
            // If there are no editable canvas 
            if (unshareListPage === -1) {
            console.log("FAIL 2")
                return myHandler(null, "");
            }
            if (userCount != 0) {
                let startIndex = unshareListPage * unshareListPerPage;
                let unshareListLength = unshareListPerPage;
                // send("GET", "/api/canvas/title/" + startIndex + "/" + unshareListLength + "/", null, function(err, res) {
                send("POST", "/api/user/unshare/" + startIndex + "/" + unshareListLength + "/", {title: currCanvasTitle}, function(err, res) {
                    if (err) {
                        return notifyErrorListeners(err);
                    }


                    let ret = res;
                    console.log("Logging the result from getting all the canvas titles")
                    console.log(ret)
                    console.log(ret)
                    ret[0].left_btn = false;
                    ret[0].right_btn = false;
                    if (startIndex > 0) {
                        ret[0].left_btn = true;
                    }
                    if (startIndex + canvasListPerPage < userCount) {
                        ret[0].right_btn = true;
                    }
                    // Note that getUsername() might not be the same user as displayGalleryOwner
                    console.log("ABOUT TEH CALL  THE UNSHARE ANDLER")
                    console.log(ret)
                    myHandler(ret, username);
                });
            } else {
                myHandler([], username);
            }
        });
    };







    // Set module.getUsername as a variable so that index.js can reference its value
    module.getUsername = getUsername;


    module.uploadCanvas = function(all) {
        // console.log("uploading canvas state");
        // console.log(all);
        //console.log(JSON.stringify(all));
        socket.emit('upload canvas', all);

        // TODO_2: remove this entire function, and replace it with the folling line,
        // where "all" is a string
        // socket.emit('upload canvas', all);
    }


    module.selectCanvas = function(owner, title) {

        console.log("SELECTED CANVAS")
        console.log(owner)
        console.log(title)
        currCanvasTitle = title;
        currCanvasOwner = owner;

        notifyUnshareListListeners();

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
        notifyUnshareListListeners();

        //
        socket.emit('switch canvas', owner, title);


        //TODO:
        // displayGalleryOwner = galleryOwner;
        // notifyImageListeners();
        // notifyCommentListeners();
        // notifyUserListeners();
    };


    module.deleteCanvas = function(owner, title) {
        // console.log("api.deleteCanvas is not implemented")
        // return;
        currCanvasTitle = null; 
        currCanvasOwner = null; 
        send("DELETE", "/api/canvas/data/" + title + "/", null, function(err, res) {
            notifyCanvasListListeners();
            notifyCanvasListeners();
            notifyUnshareListListeners();
        });
    }




    module.unshareCanvas = function(shareUsername) {
        send("DELETE", "/api/canvas/unshare/" + currCanvasTitle + "/" + shareUsername + "/", null, function(err, res) {
            notifyCanvasListListeners();
            notifyCanvasListeners();
            notifyUnshareListListeners();
        });
    }



    let getCanvasData = function(owner, title, handler) {


        send("POST", "/api/canvas/data/" + owner + "/" + title + "/", null, function(err, res) { //{owner: owner, title: title} , function(err, res) {
            if (err) {
                return notifyErrorListeners(err);
            }
            console.log("GOTTEN TEH CANVAS DATA")
            console.log(res)
            // console.log("DONE!!!!!!!!!!!!!!!");
            // console.log(res)
            // console.log(typeof(res))
            // console.log(res.owner)
            // console.log(res.canvas)
            // 
            handler(res, title, owner);
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

    module.onUnshareListUpdate = function(handler){
        unshareListListeners.push(handler);
        // TODO: get the list of canvas list listeners (pagnitaged), and call the handler

        getUnshareList(handler);

    }



    module.getRightUser = function() {
        console.log("RIGHT CLICK");
        canvasListPage++;
        notifyCanvasListListeners();
    }

    module.getLeftUser = function() {
        console.log("LEFT CLICK");
        canvasListPage--;
        notifyCanvasListListeners();
    }



    module.getRightUnshare = function() {
        unshareListPage++;
        notifyUnshareListListeners();
    }

    module.getLeftUnshare = function() {
        unshareListPage--;
        notifyUnshareListListeners();
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
                console.log(canvas)
                console.log(title)
                console.log(owner)
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


    function notifyUnshareListListeners() {

        console.log("Unshare list notify")
        unshareListListeners.forEach(function(listener){
            getUnshareList(listener);
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



