"use strict";
//Global vars required: mouseDx, mouseDy, currX, currY, gateSVG
//mouseDown, mouseOut, c (canvas context)
var mouseDx, mouseDy, currX, currY, gateSVG, mouseDown, mouseOut, c;
var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var scaleX = canvasWidth / canvas.getBoundingClientRect().width;
var scaleY = canvasHeight / canvas.getBoundingClientRect().height;
var prevX, prevY;
var tool;

var connectorID = 0;
var gateID = 0;
var gates = [];
var wires = [];
var connectors = {};

var connectorDiameter = 10;

var offsetX = canvas.offsetLeft;
var offsetY = canvas.offsetTop;

var image = document.getElementById("NOT-GATE");


function setup() {
    //do some setup here
}



$(".button-add").click(function(){
    console.log("add tool selected");
    tool = "ADD";
});

$(".button-remove").click(function(){
    console.log("remove tool selected");
    tool = "REMOVE";
});

$(".button-move").click(function(){
    console.log("move tool selected");
    tool = "MOVE";
});

$(".button-edge").click(function(){
    console.log("edgy tool selected");
    tool = "EDGE";
});

function updateMousePos(e){
    let mouseX = parseInt(e.clientX - canvas.offsetLeft);
    let mouseY = parseInt(e.clientY - canvas.offsetTop);
    prevX = currX;
    prevY = currY;
    currX = mouseX * scaleX;
    currY = mouseY * scaleY;
    mouseDx = currX - prevX;
    mouseDy = currY - prevY;
    // graphify
    // currX = Math.floor(currX/25) * 25;
    // currY = Math.floor(currY/25) * 25;
}

function updateCircuitState(){

}

//[===============Wire.js Start===============]
class WireManager{
    constructor(){
        wires = [];
        this.hover = null;
        this.drawing = false;
        this.invalid = null;
    }

    //Checks if a wire can be started from this connection
    //A wire can be started iff:
    //the connector is an output type
    //the connector is an input type and has no other wires connected
    checkConnectable(connector){
        if(connector.type == CType.OUT){
            return true;
        }
        //Input type connector, check if it has any wires already connected
        else{
            console.log("input type connector");
            //Loop through all wires, check if this connector already has wire
            for(let i = 0; i < wires.length; i++){
                let curr = wires[i]
                //If connector already has a connection
                //This only works because the current drawn wire is not in wires[]
                //If it is there is possibility of null ptr!!!!
                if(curr.end.connectorID == connector.connectorID){
                    return false;
                }
            }
        }
        return true;
    }
    //Checks if joining a wire at a given connection is valid.
    //A wire is valid iff:
    //the wire does not connect to any other connections with the same gateID
    //the wire connects to its opposite type (output to input, or input to output)
    //the connection has no wires already connected if it is of type input
    checkValid(wire, connector){
        //Wire is the wire we want to connect to potential connector
        let conGateID = connector.gateID;
        let wireStart = null;
        if(wire.start){
            wireStart = wire.start; //start is of type connector
        }
        else{
            wireStart = wire.end; //end is of type connector
        }
        let wireGateID = wireStart.gateID;
        //Check if wire connects to any other connections with same gateID as itself
        if(conGateID == wireGateID){
            return false;
        }
        //Check if the wire connents to its opposite type
        if(wireStart.type == connector.type){
            return false;
        }
        //Check if the connection already has a wire
        return this.checkConnectable(connector);
    }
    //Checks if a wire is being joined to its own start, if this happens it is
    //assumed that the user does not want to draw a wire
    checkCancel(wire, connector){
        let wireStart = null;
        if(wire.start){
            wireStart = wire.start; //start is of type connector
        }
        else{
            wireStart = wire.end; //end is of type connector
        }
        return (wireStart.connectorID == connector.connectorID);
    }

    handleMouseDown(){
        if(tool == "EDGE"){
            //Find out which connector the user is trying to draw a wire from.
            //Loop through all connector nodes
            //If not drawing currently, then start drawing, create new wire
            if(!this.drawing){
                for(var key in connectors){
                    if(connectors.hasOwnProperty(key) && 
                    connectors[key].checkMouseHitbox() && 
                    this.checkConnectable(connectors[key])){
                        //If wire is being drawn backwards (output to input)
                        //switch the start and end connectors
                        if(connectors[key].type == CType.IN){
                            this.hover = new Wire(null, connectors[key]);
                        }
                        else{
                            this.hover = new Wire(connectors[key], null);
                        }
                        console.log("creating new wire at",connectors[key]);
                        this.drawing = true;
                        break;
                    }   
                }
            }
            else{
                let cancel = true;
                for(var key in connectors){
                    if(connectors.hasOwnProperty(key) && connectors[key].checkMouseHitbox()){
                        console.log("HIT!");
                        cancel = false;
                        if(this.checkCancel(this.hover,connectors[key])){
                            this.hover = null;
                            this.drawing = false;
                            break;
                        }
                        if(this.drawing && this.checkValid(this.hover,connectors[key])){
                            this.hover.setEndpoint(connectors[key]);
                            wires.push(this.hover);
                            wires[wires.length-1].updateValue();
                            this.hover = null;
                            this.drawing = false;
                            break;
                        }
                    }
                }
                if(cancel){
                    console.log("MISS!");
                    this.hover = null;
                    this.drawing = false;
                }
            }

            
        }
        updateConnectors();
        // //Update connectors fill
        // for(var key in connectors){
        //     if(connectors.hasOwnProperty(key)){
        //         let connected = false;
        //         for(let i = 0; i < wires.length; i++){
        //             if(wires[i].start.connectorID == connectors[key].connectorID){
        //                 connected = true;
        //             }
        //             else if(wires[i].end.connectorID == connectors[key].connectorID){
        //                 connected = true;
        //             }
        //         }
        //         if(connected){
        //             connectors[key].connected = true;
        //         }
        //         else{
        //             connectors[key].connected = false;
        //         }
        //     }
        // }

        for(let i = 0; i < wires.length; i++){
            wires[i].draw();
        }
        if(this.hover){
            this.hover.draw();
        }
        
    }
    handleMouseUp(){
        console.log("LOGGING WIRE BEFORE UPLOAD")
        console.log(wires);
        //api.uploadWire(wires);
        let all = []
        all.gates = gates;
        all.wires = wires;
        all.connectors = connectors;
        all.connectorID = connectorID;
        all.gateID = gateID;
        api.uploadCanvas(all);
    }
    handleMouseMove(){
        // for(let i = 0; i < wires.length; i++){
        //     wires[i].draw();
        // }
        if(this.hover){
            this.hover.draw();
        }   
    }


}



class Node{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    updatePoint(x,y){
        this.x = x;
        this.y = y;
    }
}


class Wire{
    constructor(start, end, newValue=false, newNodes=null){
        this.start = start; //Will always be of type IN
        this.end = end; //Will always be of type OUT
        this.value = newValue;
        let x, y;
        if(this.start){
            x = this.start.x;
            y = this.start.y;
        }
        else{
            x = this.end.x;
            y = this.end.y;
        }

        // For real time sync
        // TODO: I don't think you need this?
        if (newNodes) {
            this.nodes = newNodes;
        } else {
            this.nodes = [];
            this.nodes.push(new Node(x,y));
            this.nodes.push(new Node(x,y));
        }

        console.log("THIS IS this.start in constructure of wire")
        console.log(this.start)
        
        
    }

    setEndpoint(end){
        if(this.start){
            this.end = end;
        }
        else{
            this.start = end;
        }
    }

    updateValue(){
        this.value = this.start.getValue();
        this.end.updateValue(this.value);
    }

    calculateNodePos(x1,y1,x2,y2){
        let meanX = (x1 + x2)/2;
        let meanY = (y1+y2)/2;
        if(x1 < x2){
            this.nodes[0].x = meanX;
            this.nodes[1].x = meanX;
            this.nodes[0].y = y1;
            this.nodes[1].y = y2;
        }
        else{
            this.nodes[0].x = x1;
            this.nodes[1].x = x2;
            this.nodes[0].y = meanY;
            this.nodes[1].y = meanY;
        }
        // this.nodes[0].x = x1;
        // this.nodes[0].y = y1;
        // this.nodes[1].x = x2;
        // this.nodes[1].y = y2;
        
        
    }

    draw(){
        console.log("DRAWING WIRE!!!!!!!!!!")
        c.strokeStyle = "black";
        c.beginPath();
        if(!this.start || !this.end){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        let x1, x2, y1, y2;
        if(this.start && !this.end){
            x1 = this.start.getX();
            y1 = this.start.getY();
            x2 = currX;
            y2 = currY;
        }
        else if(!this.start && this.end){
            x2 = this.end.getX();
            y2 = this.end.getY();
            x1 = currX;
            y1 = currY;
        }
        else{
            x1 = this.start.getX();
            y1 = this.start.getY();
            x2 = this.end.getX();
            y2 = this.end.getY();
        }
        this.calculateNodePos(x1,y1,x2,y2);

        c.lineJoin = "round";
        c.lineCap = "round";
        c.lineWidth = 8;
        c.strokeStyle = "black";
        c.moveTo(x1, y1);
        //c.lineTo(x2, y2);
        for(let i = 0; i < this.nodes.length; i++){
            c.lineTo(this.nodes[i].x,this.nodes[i].y);
        }
        c.lineTo(x2, y2);
        c.stroke();
        c.closePath();
        c.lineWidth = 4;
        if(this.value) c.strokeStyle = "yellow";
        else c.strokeStyle = "grey";
        c.beginPath();
        c.moveTo(x1, y1);
        for(let i = 0; i < this.nodes.length; i++){
            c.lineTo(this.nodes[i].x,this.nodes[i].y);
        }
        c.lineTo(x2, y2);
        //c.lineTo(x2, y2);
        c.stroke();
        c.closePath();



    }


}

//[===============Wire.js Start===============]








//[===============Connector.js Start===============]
function updateConnectors(){
    //Update connectors fill
    for(var key in connectors){
        if(connectors.hasOwnProperty(key)){
            let connected = false;
            for(let i = 0; i < wires.length; i++){
                if(wires[i].start.connectorID == connectors[key].connectorID){
                    connected = true;
                }
                else if(wires[i].end.connectorID == connectors[key].connectorID){
                    connected = true;
                }
            }
            if(connected){
                connectors[key].connected = true;
            }
            else{
                connectors[key].connected = false;
                connectors[key].updateValue(false);
            }
        }
    }
    //api.uploadConnector(connectors);
    //api.uploadCanvas(gates, wires, connectors);
    let all = []
    all.gates = gates;
    all.wires = wires;
    all.connectors = connectors;
    all.connectorID = connectorID;
    all.gateID = gateID;
    api.uploadCanvas(all);

    return;
}

const CType = {
    IN: 0,
    OUT: 1
}

class Connector{

    constructor(x, y, type, value, gateID, newPlaced=false, newConnected=false, newGateID=null, newConnectorID=null){
        console.log("NEW CONNECTOR!!!!!!!")
        console.log(x)
        console.log(y)
        console.log(newPlaced)
        console.log(newConnected)
        this.x = x;
        this.y = y;
        this.d = connectorDiameter;
        this.type = type;
        this.value = value;
        this.connectorID = connectorID++;
        this.placed = newPlaced;
        this.connected = newConnected;
        //keep track of parent gate
        this.gateID = gateID;

        if (newGateID) {
            // this.placed = newPlaced;
            // this.connected = newConnected;
            this.gateID = newGateID;
        }
        if (newConnectorID){
            this.connectorID = newConnectorID;
        }


    }

    destroyWires(){
        //Iterate through wires and find those which are connected
        let i = 0;
        let len = wires.length;
        while(i < len){
            if(wires[i].start.connectorID == this.connectorID ||
                wires[i].end.connectorID == this.connectorID){
                wires.splice(i, 1);
                i--;
                len--;
            }
            i++;
        }
    }

    evaluate(){

    }

    updateValue(value){
        this.value = value;
        //find other connectors with same gateID
        let output;
        let currGateID = this.gateID;
        //console.log(!this.value, LogicGate.evaluate(inputs));
        //console.log(inputs);
        for(var key in connectors){
            if(connectors.hasOwnProperty(key) &&
            connectors[key].gateID == currGateID &&
            connectors[key].type == CType.OUT){
                connectors[key].setValue(!this.value);
                //console.log(connectors[key].connectorID, this.connectorID);
                output = key;
                break;
            }
        }
        for(let i = 0; i < wires.length; i++){
            if(wires[i].start.connectorID == output){
                setTimeout(function(){wires[i].updateValue();wires[i].draw(); }, 10);
            }
        }

    }

    updatePosition(x, y){
        this.x = x;
        this.y = y;
    }

    movePosition(x, y){
        this.x = this.x + x;
        this.y = this.y + y;
    }

    setValue(value){
        this.value = value;
    }

    getValue(){
        return this.value;
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    checkMouseHitbox(){
        let a = currX - this.x;
        let b = currY - this.y;
        return (Math.sqrt((a*a) + (b*b)) < (this.d * 2));
    }

    draw(){
        console.log("draw fron connector")
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        c.beginPath();
        c.lineWidth = 4;
        if(this.checkMouseHitbox()) c.strokeStyle = "blue";
        else c.strokeStyle = "black";
        c.arc(this.x, this.y, this.d, 2 * Math.PI, false);
        if(this.connected){
            c.fillStyle = "black";
            c.fill();
        }
        c.closePath();
        c.stroke();
    }

}
//[===============Connector.js End===============]




//[===============LogicGate.js Start===============]
class GateHandler {
    constructor(){
        gates = [];
        this.hover = null;
        this.moving = null;
        this.placed = false;
    }

    handleMouseDown(){
        if(mouseDown && tool == "ADD"){
            this.hover.setPlaced(true);
            // let xpos = this.hover.valX;
            // let ypos = this.hover.valY;
            // this.hover.addInput(new Connector(xpos - 100, ypos, CType.IN, 0));
            // this.hover.addOutput(new Connector(xpos + 50, ypos, CType.OUT, 1));
            gates.push(this.hover);
            this.hover = null;
            this.placed = true;
        }
        else if(mouseDown && tool == "REMOVE"){
            //remove the newest gate
            for(let i = gates.length - 1; i >= 0; i--){
                if(gates[i].checkMouseHitbox()){
                    console.log("removing gate",i);//------------------------------------------------
                    gates[i].destroyConnectors();
                    updateConnectors();
                    gates.splice(i, 1);
                    break;
                }
            }
        }
        else if(mouseDown && tool == "MOVE"){
            for(let i = gates.length - 1; i >= 0; i--){
                if(gates[i].checkMouseHitbox()){
                    console.log("moving gate",i);
                    this.moving = gates[i];//------------------------------------------------
                    gates.splice(i, 1);
                    break;
                }
            }
        }

        for(let i = 0; i < gates.length; i++){
            gates[i].draw();
        }
        //draw hover after so that it stays on top
        if(this.hover){
            this.hover.draw();
            
        }
        if(this.moving){
            this.moving.draw();
        }
        mouseDown = false;
        //draw the connectors
        console.log("drawing connectors");
        for(var key in connectors){
            if (connectors.hasOwnProperty(key)) {           
                connectors[key].draw();
            }
        }
        for(let i = 0; i < wires.length; i++){
            wires[i].draw();
        }
    }

    handleMouseMove(){
        for(let i = 0; i < gates.length; i++){
            gates[i].draw();
        }

        if(tool != "ADD"){
            if(this.hover){
                this.hover.destroyConnectors();   //------------------------------------------------
            }
            this.hover = null;
        }
        if(tool == "ADD" && !this.placed){
            //If hover doesnt exist yet, make a new hover
            if(this.hover == null){
                let newGate = new LogicGate("NOT");
                this.hover = newGate;
            }
        }
        if(this.hover){
            this.hover.updatePosition(currX, currY);
            this.hover.draw();
        }
        if(this.moving){
            this.moving.movePosition(mouseDx, mouseDy);
            this.moving.draw();
        }
       //draw the connectors
       for(var key in connectors){
            if (connectors.hasOwnProperty(key)) {           
                connectors[key].draw();
            }
        }
        for(let i = 0; i < wires.length; i++){
            wires[i].draw();
        }
    }

    handleMouseUp(){
        this.placed = false;
        if(tool == "MOVE" && this.moving){
            gates.push(this.moving);//------------------------------------------------
            this.moving = null;
        }
        console.log("BEFORE UPLOADING GATES")
        console.log(gates)
        //api.uploadGate(gates);
        //api.uploadCanvas(gates, wires, connectors);
        //
        let all = []
        all.gates = gates;
        all.wires = wires;
        all.connectors = connectors;
        all.connectorID = connectorID;
        all.gateID = gateID;
        api.uploadCanvas(all);

    }

    handleMouseOut(){

    }
}


api.onCanvasUpdate(function (myCanvas) {
    connectorID = 0;
    gateID = 0;

    console.log("GATE UPDATE HANDLER RUNNING")
    console.log(myCanvas)
    console.log("DONE RUNNING GATE UPDATE HANDLER")

    // clear previous configuration and canvas
    //gateHandler.gates = [];
    gates = []
    connectors = []
    wires = [];

    c.clearRect(0, 0, canvas.width, canvas.height);


    //for(let i = 0; i < myCanvas.connector.length; i++){
    //
    //constructor(x, y, type, value, gateID, newPlaced=false, newConnected=false, newGateID=null){
    //

    for (key in myCanvas.connector) {
        let currConnector = myCanvas.connector[key];
        let myConnector = new Connector(
            currConnector.x,
            currConnector.y,
            currConnector.type,
            currConnector.value,
            currConnector.gateID,
            currConnector.placed,
            currConnector.connected,
            currConnector.gateID,
            currConnector.connectorID)
        connectors.push (myConnector);
    }


    if (myCanvas.gate) {
        // loop through all gates and instantiate them again
        for(let i = 0; i < myCanvas.gate.length; i++){
            let currGate = myCanvas.gate[i];

            let myGate = new LogicGate(
                currGate.type,
                currGate.width,
                currGate.height,
                currGate.valX,
                currGate.valY,
                currGate.input,
                currGate.output,
                currGate.placed,
                currGate.x,
                currGate.y,
                currGate.dx,
                currGate.dy);
            myGate.draw();
            //gateHandler.gates.push(gh);
            gates.push(myGate);

        }
    }

    
    //return;
    
    if (myCanvas.wire) {

        for(let i = 0; i < myCanvas.wire.length; i++){
            let currWire = myCanvas.wire[i];
            // let startConnector = new Connector(currWire.start.x, currWire.start.y, currWire.start.type, currWire.start.gateId);
            // let endConnector = new Connector(currWire.start.x, currWire.start.y, currWire.start.type, currWire.start.gateId);

            // let startConnector = new Connector(currWire.start.x, currWire.start.y, currWire.start.type, currWire.start.gateId);
            // let endConnector = new Connector(currWire.start.x, currWire.start.y, currWire.start.type, currWire.start.gateId);
            let startConnectorID = currWire.start.connectorID
            let endConnectorID = currWire.end.connectorID

            let startConnector;
            let endConnector;

            for(let key in connectors){
                if (connectors.hasOwnProperty(key)) {           
                    let currConnectorID = connectors[key].connectorID;
                    if (currConnectorID == startConnectorID) {
                        startConnector = connectors[key];
                    } else if (currConnectorID == endConnectorID) {
                        endConnector = connectors[key];
                    }
                }
            }

            let myWire = new Wire(
                startConnector,
                endConnector,
                currWire.value,
                currWire.nodes);


            myWire.draw();
            wires.push(myWire);

            //console.log("AFTERRRRRRRRRRRRRRRRRRRRRRRRRRRRRR")
            //console.log(wires[0].start.placed)


        }
    }

    //draw the connectors
    for(var key in connectors){
        if (connectors.hasOwnProperty(key)) {           
            connectors[key].draw();
        }
    }

    connectorID = myCanvas.connectorID;
    gateID = myCanvas.gateID;

    console.log(myCanvas.gate)
    console.log(myCanvas.connector)

});



class LogicGate {

    constructor(type, newWidth=null, newHeight=null, newValX=null, newValY=null, 
        newInput=null, newOutput=[], newPlaced=false, newX=null, newY=null, newDx=null, newDy=null){

        // if we are doing real-time sync
        if (newWidth) {
            this.type = type;
            this.width = newWidth;
            this.height = newHeight;
            this.valX = newValX;
            this.valY = newValY;
            //this.input = [new Connector(this.valX-((connectorDiameter/2)+(this.width/2)), this.valY, CType.IN, 0)];
            //this.output = new Connector(this.valX+((connectorDiameter/2)+(this.width/2)), this.valY, CType.OUT, 1);
            this.input=newInput;
            this.output=newOutput;
            this.placed = newPlaced;
            this.gateID = gateID++;
            this.x = newX;
            this.y = newY;
            this.dx = newDx;
            this.dy = newDy;

            // let input1 = new Connector(this.valX-((connectorDiameter/2)+(this.width/2)), this.valY, CType.IN, false, this.gateID);
            // let output = new Connector(this.valX+((connectorDiameter/2)+(this.width/2)), this.valY, CType.OUT, true, this.gateID);

            // connectors[input1.connectorID] = input1;
            // connectors[output.connectorID] = output;

            // this.input.push(input1.connectorID);
            // this.output = output.connectorID;

        } else {



            this.type = type;
            this.width = image.width;
            this.height = image.height;
            this.valX = currX;
            this.valY = currY;
            this.input = [];
            this.output = null;
            this.placed = false;
            this.gateID = gateID++;
            //To help with hitbox detection
            this.x;
            this.y;
            this.dx;
            this.dy;

            //this.valX+(connectorDiameter/2)+(this.width/2)
            // this.input.push(new Connector(this.valX-((connectorDiameter/2)+(this.width/2)), this.valY, CType.IN, 0, this.gateID));
            // this.output = new Connector(this.valX+((connectorDiameter/2)+(this.width/2)), this.valY, CType.OUT, 1, this.gateID);
            let input1 = new Connector(this.valX-((connectorDiameter/2)+(this.width/2)), this.valY, CType.IN, false, this.gateID);
            let output = new Connector(this.valX+((connectorDiameter/2)+(this.width/2)), this.valY, CType.OUT, true, this.gateID);

            connectors[input1.connectorID] = input1;
            connectors[output.connectorID] = output;

            this.input.push(input1.connectorID);
            this.output = output.connectorID;

        }


    }



    static evaluate(a){
        switch(this.type){
            case 0:
                return !a[0];
            case 1:
                return a[0] && a[1];
            default:
                return true;
        }
    }

    addInput(input){
        this.input.push(input);
    }
    
    addOutput(output){
        this.output = output;
    }
    setPlaced(val){
        this.placed = val;
        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].placed = val;
        }
        connectors[this.output].placed = val;

    }

    destroyConnectors(){
        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].destroyWires();
            delete connectors[this.input[i]];
        }
        connectors[this.output].destroyWires();
        delete connectors[this.output];
    }

    updatePosition(x, y){
        this.valX = x;
        this.valY = y;
        this.x = x - (this.width/2);
        this.y = y - (this.height/2);
        this.dx = x + (this.width/2);
        this.dy = y + (this.height/2);

        //console.log(this.valX, this.valY, this.x, this.y, this.dx, this.dy);
        //TODO: evenly distribute inputs along gate input side
        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].updatePosition(x-((connectorDiameter/2)+(this.width/2)), y);
        }
        connectors[this.output].updatePosition(x+((connectorDiameter/2)+(this.width/2)), y);
        
        return;
    }

    movePosition(x, y){
        this.valX = this.valX + x;
        this.valY = this.valY + y;
        this.x = this.x + x;
        this.y = this.y + y;
        this.dx = this.dx + x;
        this.dy = this.dy + y;

        for(let i = 0; i < this.input.length; i++){
            connectors[this.input[i]].movePosition(x, y);
        }
        connectors[this.output].movePosition(x,y);
        return;
    }

    //return true if mouse is inside hitbox
    checkMouseHitbox(){
        return (currX >= this.x && currX <= this.dx && currY >= this.y && currY <= this.dy);
    }

    //return true if hit box intersects this gate
    checkIntersect(x1, y1, x2, y2){
        if(this.x >= x2 || x1 >= this.dx) return false;
        if(this.y >= y2 || y1 >= this.dy) return false;
        return true;
    }

    removeInput(){

    }
    //Global vars required: mouseDx, mouseDy, currX, currY, gateSVG
    //mouseDown, mouseOut, c (canvas context)

    draw(){
        if(!this.placed){
            c.globalAlpha = 0.4;
        }
        else{
            c.globalAlpha = 1.0;
        }
        if(this.checkMouseHitbox() && this.placed){
            c.beginPath();
            c.rect(this.x, this.y, this.width, this.height);
            c.strokeStyle = "blue"
            c.lineWidth = 4;
            c.closePath();
            c.stroke();
        }
        c.beginPath();
        c.drawImage(image, this.x, this.y);
        c.stroke();
        c.closePath();
        // for(let i = 0; i < this.input.length; i++){
        //     this.input[i].draw();
        // }
        // if(this.output){
        //     this.output.draw();
        // }
    }


}
//[===============LogicGate.js End===============]


var gateHandler = new GateHandler();
var wireManager = new WireManager();



function handleMouseDown(e) {
    updateMousePos(e);
    mouseDown = true;
    $("#downlog").html("Down: " + currX + " / " + currY);
    c.clearRect(0, 0, canvas.width, canvas.height);
    gateHandler.handleMouseDown();
    wireManager.handleMouseDown();
}

function handleMouseUp(e) {
    updateMousePos(e);
    mouseDown = false;
    $("#uplog").html("Up: " + currX + " / " + currY);
    gateHandler.handleMouseUp();
    wireManager.handleMouseUp();

}

function handleMouseOut(e) {
    updateMousePos(e);
    mouseDown = false;
    $("#outlog").html("Up: " + currX + " / " + currY);
    console.log("gates",gates);
    console.log("connectors",connectors);
    console.log("wires",wires);

}

function handleMouseMove(e) {
    updateMousePos(e);
    $("#movelog").html("Move: " + currX + " / " + currY);
    c.clearRect(0, 0, canvas.width, canvas.height);
    gateHandler.handleMouseMove();
    wireManager.handleMouseMove();
}



$("#canvas").mousedown(function (e) {
    handleMouseDown(e);
});
$("#canvas").mousemove(function (e) {
    handleMouseMove(e);
});
$("#canvas").mouseup(function (e) {
    handleMouseUp(e);
});
$("#canvas").mouseout(function (e) {
    handleMouseOut(e);
});



function resize(){
    var w = window.innerWidth;
    var h = window.innerHeight;
    resizeCanvas(w,h);
}

function resizeCanvas(w, h){
    c.canvas.width = w - 20;
    c.canvas.height = h - 50;
    scaleX = canvas.width / canvas.getBoundingClientRect().width;
    scaleY = canvas.height / canvas.getBoundingClientRect().height;
}

function windowResized() {
    const canvHeight = windowHeight - 90;
    resizeCanvas(windowWidth - 115, canvHeight);
    document.getElementsByClassName("tools")[0].style.height = canvHeight;
}
resize();
$(window).resize(function () {resize();});
