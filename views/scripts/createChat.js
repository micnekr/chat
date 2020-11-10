const maxLengthOfChatName = 40;

let $errorMessage;

const chatAdmissionTypesTable = {
    "free-join": 0,
    "u-req": 1
};


$(document).ready(function () {

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    const $form = $("#form");
    const $chatName = $("#chat-name");
    const $chatAdmissionType = $(".chat-admission-type-checkbox").checkboxradio();
    $errorMessage = $(".errorMessage").hide();

    // when the chat is created
    $form.submit((evt) => {
        // do not redirect
        evt.preventDefault();

        let chatAdmissionTypeSelected = $chatAdmissionType.filter(":checked");

        //checks
        if ($chatName.val().length > maxLengthOfChatName) {
            return showErrorMessage(`The maximum length of a chat name is ${maxLengthOfChatName} characters. You typed in ${$chatName.val().length} characters.`);
        }
        if (chatAdmissionTypeSelected.length === 0) {
            return showErrorMessage('Please, select a chat admission type.')
        }

        let chatAdmissionTypeId = chatAdmissionTypesTable[chatAdmissionTypeSelected.attr("id")];

        $.post(url("createChat"), {
            chatName: $chatName.val(),
            _csrf: token,
            chatAdmissionTypeId: chatAdmissionTypeId
        }, function (data) {
            redirect("chat_created");
        }).fail(handle_AJAX_error(showErrorMessage));
    })
}); // end ready

function showErrorMessage(text) {
    $errorMessage.fadeIn().html(text);
}