$(document).ready(function () {

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


    $(".errorMessage").hide();

    $("#reset").click(() => {

        // must have a username
        if ($("#username").val() === "") {
            return showErrorMessage("No username specified for password reset");
        }
        $.post(url("reset_password/"), {
            _csrf: token,
            username: $("#username").val()
        }, function (data) {

            // ask to check the inbox
            $(".infobox").slideUp(500, function () {
                $(".infobox").html("<h3>Please, check your email inbox.</h3>");
                $(".infobox").slideDown();
            });

            // redirect("/email_confirmation_link_sent?email=" + $("#email").val())

        }).fail(handle_AJAX_error(showErrorMessage))
    })
}); // end ready

function showErrorMessage(text) {
    $(".errorMessage").fadeIn().html(text);
}
