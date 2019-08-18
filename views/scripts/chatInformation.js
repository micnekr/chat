let $header, $extraInfo, $joinChatButton, $goToChatButton, $requestAdmissionButton, $chatName, $errorMessage;
let chatName, chatId;
let csrfToken;

$.ajaxSetup({
  cache: false
});

let ajaxErrorHandler = handle_AJAX_error(showErrorMessage);

$(document).ready(function() {

  // get csrf token
  let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  let chatUsersNum = document.querySelector('meta[name="chatUsersNum"]').getAttribute('content');

  $header = $(".header>h3");
  $extraInfo = $(".extra-info");
  $joinChatButton = $("#join");
  $goToChatButton = $("#go-to");
  $requestAdmissionButton = $("#request-admission");
  $errorMessage = $(".errorMessage").hide();
  $chatName = $(".chat-name");
  chatName = getSearchQuery("name");
  chatId = getSearchQuery("chatId");
  $chatName.html(filterXSS(chatName));
  $header.html(chatName);

  // get information about the chat

  // num of people in chat
  let plural = (chatUsersNum !== "1");
  let string = plural ? "There are " + chatUsersNum + " people in this chat" : "There is 1 person in this chat";
  $extraInfo.text(string);

  // join the chat
  $joinChatButton.click(function() {
    $.post(url("joinChat/"), {
      _csrf: csrfToken,
      chatId: chatId
    }, function(reply) {
      redirect("chats_list/");
    }).fail(ajaxErrorHandler)
  })

  // go to chat
  $goToChatButton.click(function() {
    redirect("chat/", `chatId=${chatId}`);
  })

  $requestAdmissionButton.click(function() {
    $.post(url("requestAdmission/"), {
      _csrf: csrfToken,
      chatId: chatId
    }, function(reply) {
      redirect("chats_list/");
    }).fail(ajaxErrorHandler)
  })
}) // end ready

function showErrorMessage(text) {
  $errorMessage.fadeIn().html(text);
}