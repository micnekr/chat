let $header, $extraInfo, $joinChatButton, $goToChatButton, $chatName, $errorMessage;
let chatName, chatId;
let csrfToken;

let ajaxErrorHandler = handle_AJAX_error(showErrorMessage);

$(document).ready(function() {

  // get csrf token
  let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

  $header = $(".header>h3");
  $extraInfo = $(".extra-info");
  $joinChatButton = $("#join").hide();
  $goToChatButton = $("#go-to").hide();
  $errorMessage = $(".errorMessage").hide();
  $chatName = $(".chat-name");
  chatName = getCookieValue("chatNameToViewInfo");
  chatId = getCookieValue("chatIdToViewInfo");
  $chatName.html(chatName);
  $header.html(chatName);

  // get information about the chat
  $.get(url("chatUsersNum/"), function(num) {
    // display it
    let plural = (num != 1);
    let string = plural ? "There are " + num + " people in this chat" : "There is 1 person in this chat";
    $extraInfo.text(string);
  }).fail(ajaxErrorHandler);

  // check if need to reference join to chat link or start chatting link
  $.get(url("isUserInChat"), {
    chatId: chatId
  }, function(isUserInChatResponse) {
    if (isUserInChatResponse) {
      $goToChatButton.show();
    } else {
      $joinChatButton.show();
    }
  }).fail(ajaxErrorHandler);

  // join the chat
  $joinChatButton.click(function() {
    $.post(url("joinChat/"), {
      _csrf: csrfToken
    }, function(reply) {
      redirect("chats_list/");
    }).fail(ajaxErrorHandler)
  })

  // go to chat
  $goToChatButton.click(function() {
    createCookie("chatId", chatId);
    redirect("chat/");
  })
}) // end ready

function showErrorMessage(text) {
  $errorMessage.fadeIn().html(text);
}