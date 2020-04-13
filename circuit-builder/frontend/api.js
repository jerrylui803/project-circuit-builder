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

    let canvasListeners = [];
    let canvasListListeners = [];
    let unshareListListeners = [];
    let signinListeners = [];

    socket.on('broadcast canvas', (data) => {
        notifyCanvasListeners(null, null, data);
    });

    module.signin = function(username, password){
        send("POST", "/signin/", {username, password}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifySigninListeners(getUsername());
            notifyCanvasListListeners();
        });
    };

    module.signup = function(username, password){
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
        send("POST", "/api/canvas/" , {title: title}, function(err, res) {
            if (err) {
                return notifyErrorListeners(err);
            } else {
                notifyCanvasListListeners();
            }
        });

    };


    // add a new canvas to the database
    module.addShareUser = function(targetUsername){
        // This should only happen if the user edit the front end code by themselves

        send("POST", "/api/user/share/" , {title: currCanvasTitle, targetUsername: targetUsername}, function(err, res) {
            if (err) {
                return notifyErrorListeners(err);
            } else {
                notifyUnshareListListeners();
            }
        });
    };




    let canvasListPage = -1;
    let canvasListPerPage = 7; 


    let unshareListPage = -1;
    let unshareListPerPage = 7; 

    let getUsername = function(){
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };

    module.getCurrTitle = function() {
        return currCanvasTitle;
    }

    module.getCurrOwner = function() {
        return currCanvasOwner;
    }

    // Get the list of editible canvas for the current user.
    // Then pass this list to myHandler
    let getCanvasList = function(myHandler) {

        let username = getUsername();

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

                if (startIndex >= canvasCount) {
                    startIndex = startIndex - canvasListLength;
                }

                send("GET", "/api/canvas/title/" + startIndex + "/" + canvasListLength + "/", null, function(err, res) {
                    if (err) {
                        return notifyErrorListeners(err);
                    }

                    let ret = res;
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
    let getUnshareList = function(myHandler) {
        let username = getUsername();

        // If user hasn't login or is not the owner of the current display canvas
        if (username === "" || username != currCanvasOwner) {
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

            // init unshareListPage 
            if (userCount > 0 && unshareListPage === -1) {
                unshareListPage = 0;
            }
            // If there are no editable canvas 
            if (unshareListPage === -1) {
                return myHandler(null, "");
            }
            if (userCount != 0) {
                let startIndex = unshareListPage * unshareListPerPage;
                let unshareListLength = unshareListPerPage;

                if (startIndex >= userCount) {
                    startIndex = startIndex - unshareListLength;
                }

                send("POST", "/api/user/unshare/" + startIndex + "/" + unshareListLength + "/", {title: currCanvasTitle}, function(err, res) {
                    if (err) {
                        return notifyErrorListeners(err);
                    }

                    let ret = res;
                    ret[0].left_btn = false;
                    ret[0].right_btn = false;
                    if (startIndex > 0) {
                        ret[0].left_btn = true;
                    }
                    if (startIndex + canvasListPerPage < userCount) {
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


    // Set module.getUsername as a variable so that index.js can reference its value
    module.getUsername = getUsername;

    module.uploadCanvas = function(all) {
        socket.emit('upload canvas', all);
    }


    module.selectCanvas = function(owner, title) {
        currCanvasTitle = title;
        currCanvasOwner = owner;
        notifyUnshareListListeners();
    }

    module.switchCanvas = function(owner, title) {
        currCanvasTitle = title;
        currCanvasOwner = owner;

        notifyCanvasListeners(owner, title, null);
        notifyUnshareListListeners();

        socket.emit('switch canvas', owner, title);
    };


    module.deleteCanvas = function(owner, title) {
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
            handler(res, title, owner);
        });
    }


    // update the canvas itself
    module.onCanvasUpdate = function(handler){
        canvasListeners.push(handler);
    }


    // update the list of editable canvas
    module.onCanvasListUpdate = function(handler){
        canvasListListeners.push(handler);
        getCanvasList(handler);
    }

    module.onUnshareListUpdate = function(handler){
        unshareListListeners.push(handler);
        getUnshareList(handler);
    }

    module.getRightUser = function() {
        canvasListPage++;
        notifyCanvasListListeners();
    }

    module.getLeftUser = function() {
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
    };

    function notifyCanvasListeners(title, owner, canvas) {
        canvasListeners.forEach(function(listener){
            // if we do not have data to update, then call the api and ask for the data
            
            if (!canvas && title && owner) {
                getCanvasData(title, owner, listener)
            } else if (canvas && !title && !owner){
                listener(canvas, title, owner)
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
        unshareListListeners.forEach(function(listener){
            getUnshareList(listener);
        });
    }

    let errorListeners = [];

    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }

    module.onError = function(listener){
        errorListeners.push(listener);
    };

    (function refresh(){
        setTimeout(function(e){
            notifyCanvasListListeners();
            notifyUnshareListListeners();
            refresh();
        }, 4000);
    }());

    return module;
})();



