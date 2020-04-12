
(function () {
    "use strict";
    // your code goes here
    window.onload = function () {

        // For the signin/signup, signout buttons
        let username = api.getUsername();
        // let currCanvasTitle = null;
        // let currCanvasOwner = null;
        console.log("HERE IS THE USERNAME")
        console.log(username)
        if (username) {
            document.querySelector('#signout_button').classList.remove('hidden');
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


            // apr 12: commented out
            // let the user select manually
            //
            //
            // //TODO: apr 9: double check the following and see if it is actually not needed
            // //

            // let currCanvasTitle = api.getCurrCanvasTitle;
            // // If we are currently not displaying a canvas
            // if (!currCanvasTitle) { // Note that currCanvasOwner in api.js should necessarily not be null
            //     // then switch to the newly created canvas and display the canvas
            //     //
            //     //api.switchCanvas(username, title);
            //     api.selectCanvas(username, title);
            //     // document.querySelector('#myCanvas').classList.remove('hidden');
            //     // document.querySelector('#share_canvas_form').classList.remove('hidden');

            // }
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
                 <div id="switch_btn" class="btn gallery_owner_btn">owner: ${owner}    title:${title}</div>
                 <div class="delete-icon icon"></div>
                 `;

                // add this element to the document
                document.getElementById("canvas_list_display").prepend(elmt);


                elmt.querySelector('.delete-icon').addEventListener('click', function (e) {
                    // item._id is commentId
                    api.deleteCanvas(owner, title);

                    // Clear the selected canvas
                    api.selectCanvas("", "");
                    document.querySelector('#current_canvas_info').innerHTML = '';


                    console.log("THIS SHOULD BE HIDDEN NOW!!!!")
                    document.querySelector('#share_canvas_form').style.visibility = "hidden";
                    document.querySelector('#share_canvas_form').classList.add('hidden');


                });

                // if the signed in user isn't the owner of the canvas, then don't show the delete button
                if (signedInUser !== owner) {
                    elmt.querySelector('.delete-icon').style.visibility = "hidden";
                }


                // elmt.querySelector('.delete-icon').addEventListener('click', function (e) {
                //
                elmt.querySelector('#switch_btn').addEventListener('click', function(e) {
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
                    console.log("CLICKING SWITCH BTN")
                    api.selectCanvas(owner, title);


                    document.querySelector('#current_canvas_info').innerHTML = '';
                    let elmt = document.createElement('a');
                    elmt.className = "sub_header";
                    elmt.innerHTML = `
                    <div>You selected a canvas with  owner: ${owner} and  title:${title}</div>
                    `;
                    // add this element to the document
                    document.getElementById("current_canvas_info").prepend(elmt);




                    // console.log("WTF")
                    // console.log(api.getCurrCanvasOwner)
                    // console.log(api.aaa222)
                    // console.log(api.currUserIsCanvasOwner)

                    console.log("CCCCCCCCCCCCCCCC")
                    console.log(api.getUsername())

                    if (owner == api.getUsername()) {

                        document.querySelector('#share_canvas_form').style.visibility = "";
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





        api.onUnshareListUpdate(function (items, signedInUser ) {
            console.log("ON UNSHARE LIST UPDATE LOGGING")
            console.log(items)

            document.querySelector('#unshare_list_display').innerHTML = '';
            document.querySelector('#unshare_list_navigation').innerHTML = '';
            // document.querySelector("#current_user_info").innerHTML = '';


            if (items == null || items.length === 0) {
                return;
            }

            let left_btn = items[0].left_btn;
            let right_btn = items[0].right_btn;

            items.forEach(function (item) {

                // owner of the canvas
                // let owner = item.owner;
                // let title = item.title;
                let shareUsername = item.shareUsername;

                // create a new user element
                let elmt = document.createElement('div');
                elmt.className = "btn gallery_owner_btn";

                elmt.innerHTML = `
                 <div> share with : ${shareUsername}</div>
                 `;

                // add this element to the document
                document.getElementById("unshare_list_display").prepend(elmt);


                elmt.addEventListener('click', function(e) {

                    api.unshareCanvas(shareUsername);

                });
            });


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
                api.getLeftUnshare();
            });
            elmtNavigation.querySelector('#right_user_btn').addEventListener('click', function (e) {
                api.getRightUnshare();
            });
            document.getElementById("unshare_list_navigation").prepend(elmtNavigation);


        });



        document.getElementById('canvas_page').addEventListener('click', function (e) {

            console.log("TE!!!!!aaaaa")

            let currTitle = api.getCurrTitle();
            let currOwner = api.getCurrOwner();

            console.log(currTitle)
            console.log(currOwner)

            if (!currTitle || !currOwner) {
                console.log("cannot switch canvas yet because you haven't select a TITEL!!!!!!!!!!!!!!")
            } else {
                console.log("REDIRECTING")
                window.location = './canvas.html?title=' + currTitle + '&owner=' + currOwner;
            }
        });



    };
}());
