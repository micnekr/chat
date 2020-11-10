const successRedirect = "chats_list/";
const rememberMeCookieExpirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days

let $errorMessage;

let ajaxErrorHandler = handle_AJAX_error(showErrorMessage);

// go to the next page if remembered
skipIfIsRemembered();

$(document).ready(function () {

    $errorMessage = $(".errorMessage").hide();

    // when logged in, request login
    $("#form").submit((evt) => {

        evt.preventDefault();
        $.post(url("login/"), {
            username: $("#username").val(),
            password: $("#password").val(),

        }, function (data) {

            // if needed, set cookies
            if ($("#rememberMe").is(':checked')) {
                let d = new Date();
                d.setTime(d.getTime() + rememberMeCookieExpirationTime);
                let expires = "expires=" + d.toUTCString();
                createCookie("rememberMe", "true", expires);
            } else {
                createCookie("rememberMe", "false");
            }
            redirect(successRedirect);

        }).fail((xhr) => {
            $("#password").val("");

            ajaxErrorHandler(xhr);
        });
        return false;
    })
}); // end ready

function skipIfIsRemembered() {

    // if cookie was set
    if (getCookieValue("rememberMe") === "true") {
        // if authenticated, redirect.
        // prevents endless loop when the user logged out  previously
        $.get(url("isAuthenticated/"), function (isAuthenticated) {
            if (isAuthenticated) {
                redirect(successRedirect);
            }
        }).fail(function () {
            // set rememberMe to false on error
            createCookie("rememberMe", "false");
        })
    }
}

function showErrorMessage(text) {
    $errorMessage.fadeIn().html(text);
}