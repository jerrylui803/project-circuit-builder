let api = (function(){
    let module = {};

    let socket = io();

    function sendFiles(method, url, data, callback){
        let formdata = new FormData();
        Object.keys(data).forEach(function(key){
            let value = data[key];
            formdata.append(key, value);
        });
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }

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



    // // Sets the client's username
    // module.setUsername = function() {
    //     username = cleanInput($usernameInput.val().trim());

    //     // If the username is valid
    //     if (username) {
    //         $loginPage.fadeOut();
    //         $chatPage.show();
    //         $loginPage.off('click');
    //         $currentInput = $inputMessage.focus();

    //         // Tell the server your username
    //         socket.emit('add user', username);
    //     }
    // }


    // // Sends a chat message
    // module.sendMessage = function() {
    //     let message = $inputMessage.val();
    //     // Prevent markup from being injected into the message
    //     message = cleanInput(message);
    //     // if there is a non-empty message and a socket connection
    //     if (message && connected) {
    //         $inputMessage.val('');
    //         addChatMessage({
    //             username: username,
    //             message: message
    //         });
    //         // tell server to execute 'new message' and send along one parameter
    //         socket.emit('new message', message);
    //     }
    // }

    // module.typing = function() {
    //     socket.emit('typing')
    // }

    // module.stopTyping = function() {
    //     socket.emit('stop typing')
    // }

    // // Prevents input from having injected markup
    // const cleanInput = (input) => {
    //     return $('<div/>').text(input).html();
    // }

    module.uploadGate = function(myGate) {
        // Tell the server your username
        socket.emit('upload gate', myGate);
    }

    socket.on('broadcast canvas', (data) => {
        notifyCanvasListeners(data);
    });


    module.uploadWire = function(myWire) {
        // Tell the server your username
        socket.emit('upload wire', myWire);
    }





    module.aaa = function() {
        console.log("TESTING")
        console.log("TESTING")
        console.log("TESTING")
        console.log("TESTING")
        console.log("TESTING")
    }

    module.getCurrentUser = function(){
        let username = document.cookie.split("username=")[1];
        if (username.length == 0) return null;
        return username;
    };


    module.signin = function(username, password){
        send("POST", "/signin/", {username, password}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifySigninListeners(getUsername());
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


    let getUsername = function(){
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };

    let imageListeners = [];
    let commentListeners = [];
    // signinListeners is for signning in
    let signinListeners = [];
    // userListeners is for selecting gallery owners
    let userListeners = [];
    let errorListeners = [];




    let canvasListeners = [];
    module.onCanvasUpdate = function(handler){
        canvasListeners.push(handler);
        // NOTE !!!!!!!!!!!!!!!!!!!!!!
        // THIS DOES NOT CALL THE HANDLER!!!!!
    }
    function notifyCanvasListeners(canvas) {
        canvasListeners.forEach(function(listener){
            listener(canvas)
        });
    }




    module.onUserUpdate = function(handler){
        userListeners.push(handler);
        getUsernames(handler);
    };

    // call handler when an image is added or deleted from the gallery
    module.onImageUpdate = function(handler){
        imageListeners.push(handler);
        getImageItem(handler);
    };

    // call handler when a comment is added or deleted to an image
    module.onCommentUpdate = function(handler){
        commentListeners.push(handler);
        getCommentItem(handler);
    };

    module.onSigninUpdate = function(handler){
        signinListeners.push(handler);
        handler(getUsername());
        if (displayGalleryOwner === "") {
            displayGalleryOwner = getUsername();
        }
    };

    // notify all Image listeners
    function notifyImageListeners(){
        imageListeners.forEach(function(listener){
            getImageItem(listener);
        });
    }

    // notify all Image listeners
    function notifyCommentListeners(){
        commentListeners.forEach(function(listener){
            getCommentItem(listener);
        });
    }
    //NOTE: getUsername() and getUsernames() are 2 completely different functions
    //
    //      getUsername is getting a single username of the current user
    //      getUsernames is getting many user names (based on userPerPage and userPage)
    function notifySigninListeners(){
        signinListeners.forEach(function(listener){
            listener(getUsername());
        });
    }

    function notifyUserListeners(){
        userListeners.forEach(function(listener){
            getUsernames(listener);
        });
    }

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



