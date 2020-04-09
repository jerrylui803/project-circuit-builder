let api = (function(){
    "use strict";

    var module = {};

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

    module.onCanvasUpdate = function(listener){
        canvasListener.push(listener);
        getCanvas(function(err,res){
            listener(res);
        });
    }




    return module;
})();



