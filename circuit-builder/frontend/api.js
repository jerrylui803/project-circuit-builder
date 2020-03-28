let api = (function(){
    
    let module = {};

    let socket = io();






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








    // CANVAS *************************************************************************

    let canvasListeners = [];
    let signinListeners = [];

    socket.on('broadcast canvas', (data) => {
        notifyCanvasListeners(data);
    });



    module.signin = function(username, password){
        send("POST", "/signin/", {username, password}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifySigninListeners(getUsername());
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


    let getUsername = function(){
        console.log("FFF")
        console.log(document.cookie)
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };
    
    // For index.js to use 
    module.getUsername = getUsername;


    module.uploadCanvas = function(all) {
        console.log("IN API.js RIGHT BEFORE UPLOAD")
        console.log(all)
        socket.emit('upload canvas', all.gates, all.wires, all.connectors, all.gateID, all.connectorID);
    }

    module.onCanvasUpdate = function(handler){
        canvasListeners.push(handler);
    }


    module.onSigninUpdate = function(handler){
        signinListeners.push(handler);
        console.log(getUsername());
        //handler(getUsername());
        //if (displayGalleryOwner === "") {
        //    displayGalleryOwner = getUsername();
        //}
    };


    function notifyCanvasListeners(canvas) {
        canvasListeners.forEach(function(listener){
            listener(canvas)
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



