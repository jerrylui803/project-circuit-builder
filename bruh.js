

function setup() {
    //do some setup here
}
var mouseX, mouseY, tool;

var Connection = (function(){
    return function connection(parent, posX, posY){
        this.parent = parent;
        this.valX = posX;
        this.valY = posY;
        this.valZ = 0;
        this.isInput = false;
        this.snapRange = 10;
        this.state = false;
    }
}());

var Gate = (function(){
	return function gate(type){
        this.type = type;
        this.width = 100;
        this.height = 100;
        this.valX = mouseX;
        this.valY = mouseY;
        this.valZ = 0;
        this.input = [];
        this.output = new Connection
	}
}());

var Wire = (function(){
    return function wire(x, y){
        this.startX = 0;
        this.startY = 0;
        this.endX = 110;
        this.endY = 110;
        this.gate1;
        this.gate2;
    }
})

var gates = [];
var wires = [];

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

var offsetX = canvas.offsetLeft;
var offsetY = canvas.offsetTop;

var mouseX, mouseY, currX, currY;
var moving = null;
var currWire = null;

function draw(){
    var canvas = document.querySelector('canvas');
    var c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < gates.length; i++){
        let newgate = gates[i];
        c.drawImage(document.getElementById("image"), newgate.valX, newgate.valY);
    }
    for(var i = 0; i < wires.length; i++){
        let cwire = wires[i];
        //console.log(cwire.startX+','+cwire.startY+"->"+cwire.endX, cwire.endY);
        c.strokeStyle = "black";
        c.beginPath();
        c.moveTo(cwire.gate1.valX, cwire.gate1.valY);
        c.lineTo(cwire.gate2.valX, cwire.gate2.valY); 
        c.stroke();
        c.closePath();
    }
    if(currWire){
        //console.log("curr is not null "+currWire.startX+','+currWire.startY+"->"+currX, currY);
        c.strokeStyle = "red";
        c.beginPath();
        c.moveTo(currWire.startX, currWire.startY);
        c.lineTo(currX, currY);
        c.stroke();
        c.closePath();

    }
    if(tool == "MOVE" && moving){
        c.drawImage(document.getElementById("image"), currX - (moving.width/2), currY - (moving.height/2));
    }
}

function handleMouseDown(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    $("#downlog").html("Down: " + mouseX + " / " + mouseY);
    if(tool == "ADD"){
        let newgate = new Gate("NOT");
        newgate.valX = currX - (newgate.width/2);
        newgate.valY = currY - (newgate.height/2);
        gates.push(newgate);
        draw();
        console.log(newgate);
        console.log("creating new gate");
    }
    if(tool == "REMOVE"){
        for(var i = 0; i < gates.length; i++){
            let curr = gates[i];
            let x = curr.valX;
            let y = curr.valY;
            //let z = curr.valZ;
            let dx = x + curr.width;
            let dy = y + curr.height;
            if(currX >= x && currX <= dx && currY >= y && currY <= dy){
                console.log("removing gate "+i);
                gates.splice(i,1);
                break;
            }
        }
        draw();
    }
    if(tool == "MOVE"){
        for(var i = 0; i < gates.length; i++){
            let curr = gates[i];
            let x = curr.valX;
            let y = curr.valY;
            //let z = curr.valZ;
            let dx = x + curr.width;
            let dy = y + curr.height;
            if(currX >= x && currX <= dx && currY >= y && currY <= dy){
                moving = curr;
                console.log("moving "+moving.posX);
                console.log("this is curr "+curr);
                gates.splice(i,1);
                break;
            }
        }
    }
    if(tool == "EDGE"){
        for(var i = 0; i < gates.length; i++){
            let curr = gates[i];
            let x = curr.valX;
            let y = curr.valY;
            //let z = curr.valZ;
            let dx = x + curr.width;
            let dy = y + curr.height;
            if(currX >= x && currX <= dx && currY >= y && currY <= dy){
                console.log("new edge at "+curr.valX+","+curr.valY);
                var newwire = new Wire(curr.valX, curr.valY);
                newwire.gate1 = curr;
                newwire.startX = curr.valX + (curr.width/2);
                newwire.startY = curr.valY + (curr.height/2);
                currWire = newwire;
                break;
            }
        }
    }

}

function handleMouseUp(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    $("#uplog").html("Up: " + mouseX + " / " + mouseY);
    if(tool == "MOVE" && moving){
        moving.valX = currX - (moving.width/2);
        moving.valY = currY - (moving.height/2);
        gates.push(moving);
        moving = null;
    }
    if(tool == "EDGE" && currWire){
        for(var i = 0; i < gates.length; i++){
            let curr = gates[i];
            let x = curr.valX;
            let y = curr.valY;
            //let z = curr.valZ;
            let dx = x + curr.width;
            let dy = y + curr.height;
            if(currX >= x && currX <= dx && currY >= y && currY <= dy){
                console.log("new edge ending at "+curr.valX+","+curr.valY);
                currWire.endX = curr.valX;
                currWire.endY = curr.valY;
                currWire.gate2 = curr;
                wires.push(currWire)
                console.log(currWire);
                currWire = null;
                break;
            }
        }
    }
    
}

function handleMouseOut(e) {
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    $("#outlog").html("Out: " + mouseX + " / " + mouseY);
    if(tool == "MOVE" && moving){
        moving.valX = currX - (moving.width/2);
        moving.valY = currY - (moving.height/2);
        gates.push(moving);
        moving = null;
    }

}

function handleMouseMove(e) {
    var canvas = document.querySelector('canvas');
    var c = canvas.getContext('2d');
    mouseX = parseInt(e.clientX - canvas.offsetLeft);
    mouseY = parseInt(e.clientY - canvas.offsetTop);
    scaleX = canvas.width / canvas.getBoundingClientRect().width;
    scaleY = canvas.height / canvas.getBoundingClientRect().height;
    currX = mouseX * scaleX;
    currY = mouseY * scaleY;
    // currX = Math.floor(currX/25) * 25;
    // currY = Math.floor(currY/25) * 25;
    $("#movelog").html("Move: " + currX + " / " + currY);
    if(tool == "REMOVE"){
        draw();
        for(var i = 0; i < gates.length; i++){
            let curr = gates[i];
            let x = curr.valX;
            let y = curr.valY;
            //let z = curr.valZ;
            let dx = x + curr.width;
            let dy = y + curr.height;
            if(currX >= x && currX <= dx && currY >= y && currY <= dy){
                c.beginPath();
                c.strokeStyle = "red";
                c.rect(x,y,curr.width,curr.height);
                c.stroke();
                c.closePath();
            }
        }
    }
    if(tool == "MOVE"){
        draw();
        for(var i = 0; i < gates.length; i++){
            let curr = gates[i];
            let x = curr.valX;
            let y = curr.valY;
            //let z = curr.valZ;
            let dx = x + curr.width;
            let dy = y + curr.height;
            if(currX >= x && currX <= dx && currY >= y && currY <= dy){
                c.beginPath();
                c.strokeStyle = "blue";
                c.rect(x,y,curr.width,curr.height);
                c.stroke();
                c.closePath();
            }
        }
    }
    if(tool == "EDGE"){
        draw();
        for(var i = 0; i < gates.length; i++){
            let curr = gates[i];
            let x = curr.valX;
            let y = curr.valY;
            //let z = curr.valZ;
            let dx = x + curr.width;
            let dy = y + curr.height;
            if(currX >= x && currX <= dx && currY >= y && currY <= dy){
                c.beginPath();
                c.strokeStyle = "green";
                c.rect(x,y,curr.width,curr.height);
                c.stroke();
                c.closePath();
            }
        }
    }
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
    var canvas = document.querySelector('canvas');
    var c = canvas.getContext('2d');
    c.canvas.width = w - 20;
    c.canvas.height = h - 50;
}

function windowResized() {
    const canvHeight = windowHeight - 90;
    resizeCanvas(windowWidth - 115, canvHeight);
    document.getElementsByClassName("tools")[0].style.height = canvHeight;
}
resize();
$(window).resize(function () {resize();});