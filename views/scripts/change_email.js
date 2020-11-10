$(document).ready(function () {

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


    $(".errorMessage").hide();

    // replace the email value
    $("#email").val(decodeURIComponent(getCookieValue("email")));

    $("#verify").click(() => {
        $.post(url("change_email/"), {
            _csrf: token,
            email: $("#email").val()
        }, function (data) {

            redirect("/email_confirmation_link_sent?email=" + $("#email").val())

        }).fail(handle_AJAX_error(showErrorMessage))
    })
}); // end ready

function showErrorMessage(text) {
    $(".errorMessage").fadeIn().html(text);
}