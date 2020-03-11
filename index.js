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

//[===============Connector.js Start===============]
const CType = {
    IN: 0,
    OUT: 1
}

class Connector{
    constructor(x, y, type, value){
        this.x = x;
        this.y = y;
        this.d = connectorDiameter;
        this.type = type;
        this.value = value;
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
        return (dist(currX, currY, this.x, this.y) < (this.d) / 2);
    }

    draw(){
        c.beginPath();
        c.lineWidth = 4;
        c.strokeStyle = "black";
        c.arc(this.x, this.y, this.d, 2 * Math.PI, false);
        c.closePath();
        c.stroke();
    }

}
//[===============Connector.js End===============]




//[===============LogicGate.js Start===============]
class GateHandler {
    constructor(){
        this.gates = [];
        this.hover = null;
        this.moving = null;
        this.placed = false;
    }

    handleMouseDown(){
        if(mouseDown && tool == "ADD"){
            this.hover.placed = true;
            // let xpos = this.hover.valX;
            // let ypos = this.hover.valY;
            // this.hover.addInput(new Connector(xpos - 100, ypos, CType.IN, 0));
            // this.hover.addOutput(new Connector(xpos + 50, ypos, CType.OUT, 1));
            this.gates.push(this.hover);
            this.hover = null;
            this.placed = true;
        }
        else if(mouseDown && tool == "REMOVE"){
            //remove the newest gate
            for(let i = this.gates.length - 1; i >= 0; i--){
                if(this.gates[i].checkMouseHitbox()){
                    console.log("removing gate",i);
                    this.gates.splice(i, 1);
                    break;
                }
            }
        }
        else if(mouseDown && tool == "MOVE"){
            for(let i = this.gates.length - 1; i >= 0; i--){
                if(this.gates[i].checkMouseHitbox()){
                    console.log("moving gate",i);
                    this.moving = this.gates[i];
                    this.gates.splice(i, 1);
                    break;
                }
            }
        }

        for(let i = 0; i < this.gates.length; i++){
            this.gates[i].draw();
        }
        //draw hover after so that it stays on top
        if(this.hover){
            this.hover.draw();
            
        }
        if(this.moving){
            this.moving.draw();
        }
        
    }

    handleMouseMove(){
        for(let i = 0; i < this.gates.length; i++){
            this.gates[i].draw();
        }

        if(tool != "ADD"){
            this.hover = null;
        }
        if(tool == "ADD" && !this.placed){
            let newGate = new LogicGate("NOT");
            this.hover = newGate;
        }
        if(this.hover){
            this.hover.updatePosition(currX, currY);
            this.hover.draw();
        }
        if(this.moving){
            this.moving.movePosition(mouseDx, mouseDy);
            this.moving.draw();
        }

    }

    handleMouseUp(){
        this.placed = false;
        if(tool == "MOVE" && this.moving){
            this.gates.push(this.moving);
            this.moving = null;
        }
    }

    handleMouseOut(){

    }



}



class LogicGate {
    constructor(type){
        this.type = type;
        this.width = image.width;
        this.height = image.height;
        this.valX = currX;
        this.valY = currY;
        this.input = [];
        this.output = null;
        this.placed = false;

        //To help with hitbox detection
        this.x;
        this.y;
        this.dx;
        this.dy;

        //this.valX+(connectorDiameter/2)+(this.width/2)
        this.input.push(new Connector(this.valX-((connectorDiameter/2)+(this.width/2)), this.valY, CType.IN, 0));
        this.output = new Connector(this.valX+((connectorDiameter/2)+(this.width/2)), this.valY, CType.OUT, 1);
    }

    addInput(input){
        this.input.push(input);
    }
    
    addOutput(output){
        this.output = output;
    }

    updatePosition(x, y){
        this.valX = x;
        this.valY = y;
        this.x = x - (this.width/2);
        this.y = y - (this.height/2);
        this.dx = x + (this.width/2);
        this.dy = y + (this.height/2);

        //console.log(this.valX, this.valY, this.x, this.y, this.dx, this.dy);

        // for(let i = 0; i < this.input.length; i++){
        //     this.input[i].updatePosition(x, y);
        // }
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
            this.input[i].movePosition(x, y);
        }
        this.output.movePosition(x,y);
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
        for(let i = 0; i < this.input.length; i++){
            this.input[i].draw();
        }
        if(this.output){
            this.output.draw();
        }
    }


}
//[===============LogicGate.js End===============]


var gateHandler = new GateHandler();



function handleMouseDown(e) {
    updateMousePos(e);
    mouseDown = true;
    $("#downlog").html("Down: " + currX + " / " + currY);
    c.clearRect(0, 0, canvas.width, canvas.height);
    gateHandler.handleMouseDown();
}

function handleMouseUp(e) {
    updateMousePos(e);
    mouseDown = false;
    $("#uplog").html("Up: " + currX + " / " + currY);
    gateHandler.handleMouseUp();

}

function handleMouseOut(e) {
    updateMousePos(e);
    mouseDown = false;
    $("#outlog").html("Up: " + currX + " / " + currY);

}

function handleMouseMove(e) {
    updateMousePos(e);
    $("#movelog").html("Move: " + currX + " / " + currY);
    c.clearRect(0, 0, canvas.width, canvas.height);
    gateHandler.handleMouseMove();
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
