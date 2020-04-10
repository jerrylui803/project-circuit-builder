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
    });
    $("#canvas").mousemove(function (e) {
        handleMouseMove(e);
        //api.uploadCanvas(sim.getJSON());
        if ((lastExecution.getTime() + timeWindow) <= (new Date()).getTime()) {
            lastExecution = new Date();
            api.uploadCanvas(sim.getJSON());
        }
    });
    $("#canvas").mouseup(function (e) {
        handleMouseUp(e);
    });
    $("#canvas").mouseout(function (e) {
        handleMouseOut(e);
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
        sim.setComponent(PORT.IN);
        sim.setTool(TOOL.PORT);
    });
    $(".button-out").click(function(){
        sim.setComponent(PORT.OUT);
        sim.setTool(TOOL.PORT);
    });

    $("#slider1").change(function(e){
        speed = $("#slider1").val();
        //sim.setSimSpeed(speed);
        //console.log($("#slider1").val());
    });


    api.onCanvasUpdate(function (myCanvas, title, owner) {

        document.querySelector('#current_canvas_info').innerHTML = '';

        let elmt = document.createElement('a');
        elmt.className = "sub_header";
        elmt.innerHTML = `
                 <div>currently viewing    owner: ${owner}    title:${title}</div>
                 `;

        // add this element to the document
        document.getElementById("current_canvas_info").prepend(elmt);


        sim.updateState(myCanvas);
        return;
    });







    // ---------------------------- The rest of the files are not for the canvas --------------------------------

    // For the signin/signup, signout buttons
    let username = api.getUsername();
    // let currCanvasTitle = null;
    // let currCanvasOwner = null;
    console.log("HERE IS THE USERNAME")
    console.log(username)
    if (username) {
        document.querySelector('#signout_button').classList.remove('hidden');
        //document.querySelector('#new_image_form_and_hide_btn').classList.remove('hidden');
        //document.querySelector('#canvas').classList.remove('hidden');
        document.querySelector('#new_canvas_form').classList.remove('hidden');
        document.querySelector('#canvas_list').classList.remove('hidden');

        // TODO: add check: if the current canvas is owned by the current user then remove hidden from "new_canvas_form"
        

    } else {
        document.querySelector('#signin_button').classList.remove('hidden');
    }

    document.getElementById('new_canvas_form').addEventListener('submit', function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        // read form elements
        let title = document.getElementById("canvas_title").value;

        // clean form
        document.getElementById("new_canvas_form").reset();
        api.addCanvas(title);

        let currCanvasTitle = api.getCurrCanvasTitle;
        // If we are currently not displaying a canvas
        if (!currCanvasTitle) { // Note that currCanvasOwner in api.js should necessarily not be null
            // then switch to the newly created canvas and display the canvas
            api.switchCanvas(username, title);
            document.querySelector('#myCanvas').classList.remove('hidden');



            // TODO: DOUBLE CHECK THIS
            document.querySelector('#share_canvas_form').classList.remove('hidden');

        }
    });



    document.getElementById('share_canvas_form').addEventListener('submit', function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();
        // read form elements
        let target_username = document.getElementById("target_username").value;

        // clean form
        document.getElementById("share_canvas_form").reset();
        api.addShareUser(target_username);


        // TODO: Add any function later to update the target user's interface
        //
        // I think there is no need to do any addition update on the current user's front end


    });




    api.onCanvasListUpdate(function (items, signedInUser ) {
        console.log("ON CANVAS LIST UPDATE LOGGING")
        console.log(items)
        console.log(signedInUser)

        document.querySelector('#canvas_list_display').innerHTML = '';
        document.querySelector('#canvas_list_navigation').innerHTML = '';
        document.querySelector("#current_user_info").innerHTML = '';

        // Either tell user to sign in, or display current username (and gallery currently displayed)
        let elmtUserInfo = document.createElement('a');
        elmtUserInfo.className = "sub_header";

        if (signedInUser) {
            elmtUserInfo.innerHTML = `
                    <div>Signed in as:             ${signedInUser}</div>
                    `;

                    // <div>Viewing gallery owned by: ${displayGalleryOwner}</div>
                    // `;
        } else {
            elmtUserInfo.innerHTML = `
                <div>Please sign in to continue
                `;
        }
        document.getElementById("current_user_info").prepend(elmtUserInfo);

        if (items == null || items.length === 0) {
            return;
        }

        let left_btn = items[0].left_btn;
        let right_btn = items[0].right_btn;

        items.forEach(function (item) {

            // owner of the canvas
            let owner = item.owner;
            let title = item.title;

            // create a new user element
            let elmt = document.createElement('div');
            elmt.className = "btn gallery_owner_btn";
            elmt.innerHTML = `
                 <div>owner: ${owner}    title:${title}</div>
                 `;

            // add this element to the document
            document.getElementById("canvas_list_display").prepend(elmt);

            elmt.addEventListener('click', function(e) {
                // document.querySelector("#current_user_info").innerHTML = '';

                // // create a new user element
                // let elmtUserInfo = document.createElement('a');
                // elmtUserInfo.className = "sub_header";
                // elmtUserInfo.innerHTML = `
                // <div>Signed in as: ${signedInUser}</div>
                // <div>Viewing gallery owned by: ${author}</div>
                // `;
                // document.getElementById("current_user_info").prepend(elmtUserInfo);
                //
                api.switchCanvas(owner, title);

                document.querySelector('#myCanvas').classList.remove('hidden');

                // console.log("WTF")
                // console.log(api.getCurrCanvasOwner)
                // console.log(api.aaa222)
                // console.log(api.currUserIsCanvasOwner)

                console.log("CCCCCCCCCCCCCCCC")
                console.log(api.getUsername())

                if (owner == api.getUsername()) {
                    document.querySelector('#share_canvas_form').classList.remove('hidden');
                }


                // TODO: check if the following code is really needed
                //       If we are not reloading the whole page, we might not need to
                //       re-remove the 'hidden' class

                // let currCanvasTitle = api.getCurrCanvasTitle;
                // // If we are currently not displaying a canvas
                // if (!currCanvasTitle) { // Note that currCanvasOwner in api.js should necessarily not be null
                //     // then switch to the newly created canvas and display the canvas
                //     api.switchCanvas(username, title);
                //     document.querySelector('#myCanvas').classList.remove('hidden');

                //     let currCanvasOwner = api.getCurrCanvasOwner;
                //     console.log("currCanvasOwner")
                //     console.log(currCanvasOwner)

                //     if (api.currUserIsCanvasOwner) {
                //         document.querySelector('#share_canvas_form').classList.remove('hidden');
                //     }


                // }


            });
        });

        // Not needed for canvas list
        // // Hide the add-image form as it might be confusing to show add-image form when the user
        // // is viewing a different person's gallery
        // // (the backend does not care, since the backend will only look at the sessionId to determine
        // // who is adding the image)
        // if (signedInUser !== displayGalleryOwner) {
        //     document.getElementById("new_image_form_and_hide_btn").style.visibility = "hidden";
        //     let x = document.getElementById("new_image_form");
        //     x.style.display = "none";
        // } else {
        //     document.getElementById("new_image_form_and_hide_btn").style.visibility = "";
        //     let x = document.getElementById("new_image_form");
        //     x.style.display = "";
        // }


        // create a new element for the navigation buttons
        let elmtNavigation = document.createElement('div');
        elmtNavigation.innerHTML = `
            <div class="left_right_btn_container">
                <div id="left_user_btn" class="btn small_btn left_btn">Last Page</div>
                <div id="right_user_btn" class="btn small_btn right_btn">Next Page</div>
            </div>
            `;

        if (!left_btn) {
            elmtNavigation.querySelector('#left_user_btn').style.visibility = "hidden";
        }
        if (!right_btn) {
            elmtNavigation.querySelector('#right_user_btn').style.visibility = "hidden";
        }
        elmtNavigation.querySelector('#left_user_btn').addEventListener('click', function (e) {
            api.getLeftUser();
        });
        elmtNavigation.querySelector('#right_user_btn').addEventListener('click', function (e) {
            api.getRightUser();
        });
        document.getElementById("canvas_list_navigation").prepend(elmtNavigation);



   });


});
