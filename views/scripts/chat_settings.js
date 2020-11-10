let $errorMessage, $admissionsBox;

$.ajaxSetup({
    cache: false
});

const chatId = getSearchQuery("chatId");

$(document).ready(function () {
    $errorMessage = $(".error-message").hide();
    $admissionsBox = $(".admissions-box").hide();

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // table which centers chat admissions
    let $admissionsAligner = $("#admissions-aligner");

    $admissionsAligner.on("click", "div > button", function (obj) {
        let isAccept = $(this).hasClass("accept-button");
        let $admissionEntryDiv = $(this).closest(".admission-entry");
        let userId = $admissionEntryDiv.find(".id-container").text();

        // hide entry
        $admissionEntryDiv.slideUp();

        $.post(url("acceptOrRejectAdmissionRequest/"), {
            chatId: chatId,
            userId: userId,
            isAddToChat: isAccept,
            _csrf: token
        }, function (data) {
            console.log(data);
        }).fail(handle_AJAX_error(showErrorMessage));
    });

    // get all chat admissions
    $.get(url("getListOfAdmissionsRequests/"), {
        chatId: chatId
    }, (data) => {

        // if there are requests
        if (data[0]) {
            $admissionsBox.show();

            // display
            addAdmissions(data, $admissionsAligner)
        }
    }).fail(handle_AJAX_error(showErrorMessage));
}); // end ready

// makes html for chat ref
function buildAdmissionEntry(object) {
    return `<tr><td><div class="admission-entry"><div class="id-container">${object.user_id}</div><p>${object.username}</p><button class="accept-button">Accept</button><button class="reject-button">Reject</button></div></td></tr>`
}

// adds all chat refs
function addAdmissions(chats, $admissionsAligner) {
    for (chat of chats) {
        $admissionsAligner.append(buildAdmissionEntry(chat));
    }
}

function showErrorMessage(text) {
    $errorMessage.fadeIn().html(text);
}