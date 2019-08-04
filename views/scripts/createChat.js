const maxLengthOfChatName = 40;

let $errorMessage;

$(document).ready(function() {

  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  const $form = $("#form");
  const $chatName = $("#chat-name");
  $errorMessage = $(".errorMessage").hide();

  // when the chat is created
  $form.submit((evt) => {
    // do not redirect
    evt.preventDefault();

    //checks
    if ($chatName.val().length > maxLengthOfChatName) {
      return showErrorMessage(`The maximum length of a chat name is ${maxLengthOfChatName} characters. You typed in ${$chatName.val().length} characters.`)
    }

    $.post(url("createChat"), {
      chatName: $chatName.val(),
      _csrf: token
    }, function(data) {
      redirect("chat_created");
    }).fail(handle_AJAX_error(showErrorMessage));
  })
}) // end ready

function showErrorMessage(text) {
  $errorMessage.fadeIn().html(text);
}