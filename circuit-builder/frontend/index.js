(function () {
    "use strict";
    // your code goes here
    window.onload = function () {

        // For the signin/signup, signout buttons
        let username = api.getUsername();
        if (username) {
            document.querySelector('#signout_button').classList.remove('hidden');
            document.querySelector('#new_canvas_form').classList.remove('hidden');
            document.querySelector('#canvas_list').classList.remove('hidden');
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
        });

        document.getElementById('share_canvas_form').addEventListener('submit', function (e) {
            // prevent from refreshing the page on submit
            e.preventDefault();
            // read form elements
            let target_username = document.getElementById("target_username").value;

            // clean form
            document.getElementById("share_canvas_form").reset();
            api.addShareUser(target_username);
        });

        api.onCanvasListUpdate(function (items, signedInUser ) {
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
                 <div id="switch_btn" class="btn gallery_owner_btn">owner: ${owner}    title: ${title}</div>
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

                    document.querySelector('#share_canvas_form').style.visibility = "hidden";
                    document.querySelector('#share_canvas_form').classList.add('hidden');
                });

                // if the signed in user isn't the owner of the canvas, then don't show the delete button
                if (signedInUser !== owner) {
                    elmt.querySelector('.delete-icon').style.visibility = "hidden";
                }

                elmt.querySelector('#switch_btn').addEventListener('click', function(e) {
                    api.selectCanvas(owner, title);

                    document.querySelector('#current_canvas_info').innerHTML = '';
                    let elmt = document.createElement('a');
                    elmt.className = "sub_header";
                    elmt.innerHTML = `
                    <div>You selected a canvas with  owner: ${owner} and  title: ${title}</div>
                    `;
                    // add this element to the document
                    document.getElementById("current_canvas_info").prepend(elmt);

                    if (owner == api.getUsername()) {
                        document.querySelector('#share_canvas_form').style.visibility = "";
                        document.querySelector('#share_canvas_form').classList.remove('hidden');
                    }
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
                api.getLeftUser();
            });
            elmtNavigation.querySelector('#right_user_btn').addEventListener('click', function (e) {
                api.getRightUser();
            });
            document.getElementById("canvas_list_navigation").prepend(elmtNavigation);
        });


        api.onUnshareListUpdate(function (items, signedInUser ) {
            document.querySelector('#unshare_list_display').innerHTML = '';
            document.querySelector('#unshare_list_navigation').innerHTML = '';

            if (items == null || items.length === 0) {
                return;
            }

            let left_btn = items[0].left_btn;
            let right_btn = items[0].right_btn;

            items.forEach(function (item) {

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
            let currTitle = api.getCurrTitle();
            let currOwner = api.getCurrOwner();

            if (currTitle && currOwner) {
                window.location = './canvas.html?title=' + currTitle + '&owner=' + currOwner;
            }
        });
    };
}());
