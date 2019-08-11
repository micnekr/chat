let $errorMessage;

const maxNotificationNum = 99;

$(document).ready(function() {

  $errorMessage = $(".error-message").hide();

  // table which centers chat suggestions
  let $chatsRefsAligner = $("#chats-aligner");

  // when a chat ref is clicked, redirect
  $chatsRefsAligner.on("click", "div", function() {
    let $this = $(this);
    let chatId = $this.attr('id');
    redirect("chat_settings/", `chatId=${chatId}`);
  });

  // get all chat refs
  $.get(url("getAdminChatsListAndNotifications/"), (data) => {

    // sort the data
    data.sort(sortByNumberOfNotifications);

    // sort them and display
    addRefs(data, $chatsRefsAligner)
  }).fail(handle_AJAX_error(showErrorMessage));


  // when the button to create a chat is pressed, redirect
  $("button.create-chat").click(() => {
    redirect("create_chat/");
  })
}) // end ready

// makes html for chat ref
function buildChatRef(object) {
  return `<tr><td><div class="chat-ref pointer" id="${object.id}">${object.name}<div class="notification-circle"></div></div></td></tr>`
}

// adds all chat refs
function addRefs(chats, $chatsRefsAligner) {
  for (chat of chats) {
    $chatsRefsAligner.append(buildChatRef(chat));

    // set notifications num
    let notificationsNum = chat.admission_requests_count;

    // show it only if there are notifications
    if (notificationsNum > 0) {

      if (notificationsNum > maxNotificationNum) {
        notificationsNum = maxNotificationNum;
      }

      // show that circle and set the number
      $(".chat-ref > .notification-circle").last().text(notificationsNum).show();
    }
  }
}

function sortByNumberOfNotifications(a, b) {
  return b.admission_requests_count - a.admission_requests_count
}

function showErrorMessage(text) {
  $errorMessage.fadeIn().html(text);
}