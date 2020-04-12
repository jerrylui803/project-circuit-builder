import {Simulator} from "./simulator.js";
import {CONNECTOR,GATE,PORT,TOOL} from "./Enumeration.js";

$(document).ready(function(){
    let mouseDx, mouseDy;
    let currX, currY;
    let prevX, prevY;
    var speed = 10;

    let canvas = document.querySelector('canvas');
    let c = canvas.getContext('2d');

    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    let scaleX = canvasWidth / canvas.getBoundingClientRect().width;
    let scaleY = canvasHeight / canvas.getBoundingClientRect().height;

    let offsetX = canvas.offsetLeft;
    let offsetY = canvas.offsetTop;

    document.getElementById('INPUT').setAttribute("height", "50px");
    document.getElementById('OUTPUT').setAttribute("height", "50px");

    let images = [];
    images.push(document.getElementById("NOT-GATE"));
    images.push(document.getElementById("AND-GATE"));
    images.push(document.getElementById("OR-GATE"));
    images.push(document.getElementById("NAND-GATE"));
    images.push(document.getElementById("NOR-GATE"));
    images.push(document.getElementById("XOR-GATE"));
    images.push(document.getElementById("XNOR-GATE"));
    images.push(document.getElementById("INPUT"));
    images.push(document.getElementById("OUTPUT"));
    let sim = new Simulator(c,images);

    function resize(){
        let w = window.innerWidth;
        let h = window.innerHeight;
        resizeCanvas(w,h);
    }

    function resizeCanvas(w, h){
        c.canvas.width = w - 20;
        c.canvas.height = h - 50;
        scaleX = canvas.width / canvas.getBoundingClientRect().width;
        scaleY = canvas.height / canvas.getBoundingClientRect().height;
        offsetX = canvas.offsetLeft;
        offsetY = canvas.offsetTop;
    }

    function updateMousePos(e){
        let mouseX = parseInt(e.clientX - canvas.offsetLeft);
        let mouseY = parseInt(e.clientY - canvas.offsetTop);
        prevX = currX;
        prevY = currY;
        currX = (mouseX * scaleX) + document.body.scrollLeft + document.documentElement.scrollLeft;;
        currY = (mouseY * scaleY) + document.body.scrollTop + document.documentElement.scrollTop;;
        mouseDx = currX - prevX;
        mouseDy = currY - prevY;
    }

    function handleMouseDown(e) {
        updateMousePos(e)
        $("#downlog").html("Down: " + currX + " / " + currY);
        sim.handleMouseDown(currX, currY, mouseDx, mouseDy);
    }

    function handleMouseUp(e) {
        updateMousePos(e);
        $("#uplog").html("Up: " + currX + " / " + currY);
        sim.handleMouseUp(currX, currY, mouseDx, mouseDy);
    }

    function handleMouseOut(e) {
        updateMousePos(e);
        $("#outlog").html("Out: " + currX + " / " + currY);
        sim.handleMouseOut(currX, currY, mouseDx, mouseDy);
    }

    function handleMouseMove(e) {
        updateMousePos(e);
        $("#movelog").html("Move: " + currX + " / " + currY);
        sim.handleMouseMove(currX, currY, mouseDx, mouseDy);
    }

    let timeWindow = 500; // time in ms
    let lastExecution = new Date((new Date()).getTime() - timeWindow);

    $("#canvas").mousedown(function (e) {
        handleMouseDown(e);
        //api.uploadCanvas(sim.getJSON());
    });
    $("#canvas").mousemove(function (e) {
        handleMouseMove(e);
        //api.uploadCanvas(sim.getJSON());
        //api.uploadCanvas(sim.getJSON());
        // if ((lastExecution.getTime() + timeWindow) <= (new Date()).getTime()) {
        //     lastExecution = new Date();
        //     api.uploadCanvas(sim.getJSON());
        // }
    });
    $("#canvas").mouseup(function (e) {
        handleMouseUp(e);
        //api.uploadCanvas(sim.getJSON());
    });
    $("#canvas").mouseout(function (e) {
        handleMouseOut(e);
        //api.uploadCanvas(sim.getJSON());
    });
    $(window).resize(function () {
        resize();
    });
    resize();
    //setInterval(function(){sim.simulate(currX,currY)}, speed);
    timeout();
    function timeout() {
        setTimeout(function () {
            sim.simulate(currX,currY);
            timeout();
        }, speed);
    }


    $(".button-remove").click(function(){
        sim.setTool(TOOL.DELETE);
    });
    $(".button-move").click(function(){
        sim.setTool(TOOL.MOVE);
    });
    $(".button-edge").click(function(){
        sim.setTool(TOOL.WIRE);
    });

    $(".button-not").click(function(){
        sim.setComponent(GATE.NOT);
    });
    $(".button-and").click(function(){
        sim.setComponent(GATE.AND);
    });
    $(".button-or").click(function(){
        sim.setComponent(GATE.OR);
    });
    $(".button-nor").click(function(){
        sim.setComponent(GATE.NOR);
    });
    $(".button-nand").click(function(){
        sim.setComponent(GATE.NAND);
    });
    $(".button-xor").click(function(){
        sim.setComponent(GATE.XOR);
    });
    $(".button-xnor").click(function(){
        sim.setComponent(GATE.XNOR);
    });
    $(".button-in").click(function(){
        sim.setComponent(GATE.IN);
        sim.setTool(TOOL.PORT);
    });
    $(".button-out").click(function(){
        sim.setComponent(GATE.OUT);
        sim.setTool(TOOL.PORT);
    });

    $("#slider1").change(function(e){
        speed = $("#slider1").val();
        //sim.setSimSpeed(speed);
        //console.log($("#slider1").val());
    });


    api.onCanvasUpdate(function (myCanvas, title, owner) {

       
        sim.updateState(myCanvas);
        return;
    });


    // Switch to the canvas base on the url parameters

    // https://www.sitepoint.com/get-url-parameters-with-javascript/
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const currTitle = urlParams.get('title')
    const currOwner = urlParams.get('owner')

    console.log("HERE IS TEH PARAMETERS:")
    console.log(currTitle)
    console.log(currOwner)
   
    api.switchCanvas(currOwner, currTitle)

    
    document.querySelector('#current_canvas_info').innerHTML = '';
    let elmt = document.createElement('a');
    elmt.className = "sub_header";
    elmt.innerHTML = `
                 <div>currently viewing    owner: ${currOwner}    title:${currTitle}</div>
                 `;
    // add this element to the document
    document.getElementById("current_canvas_info").prepend(elmt);



});

