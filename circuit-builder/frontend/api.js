let api = (function(){
    
    let module = {};

    let socket = io();



    // CANVAS *************************************************************************

    let canvasListeners = [];

    socket.on('broadcast canvas', (data) => {
        notifyCanvasListeners(data);
    });

    module.uploadCanvas = function(all) {
        console.log("IN API.js RIGHT BEFORE UPLOAD")
        console.log(all)
        socket.emit('upload canvas', all.gates, all.wires, all.connectors, all.gateID, all.connectorID);
    }

    module.onCanvasUpdate = function(handler){
        canvasListeners.push(handler);
    }

    function notifyCanvasListeners(canvas) {
        canvasListeners.forEach(function(listener){
            listener(canvas)
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



