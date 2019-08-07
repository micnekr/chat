let maxChars;
let userName;
let socket;
let csrfToken;

let $msgTable, $messageBox, $messageTableContainer, $charactersCounter, $errorMessage;

const chatId = getSearchQuery("chatId");


$(document).ready(function() {

  // get csrf token
  let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  //socket io
  socket = io(undefined, {
    query: "_csrf=" + csrfToken
  });

  // set selections
  $msgTable = $(".messages-box>table");
  $messageBox = $("#type-message");
  $messageTableContainer = $(".messages-box");
  $charactersCounter = $(".character_counter");
  $errorMessage = $(".errorMessage").hide();

  $.get(url("loadChatAndMessagingInfo"), {
    chatId: chatId
  }, (data) => {

    // the messages come reversed
    data.messages.reverse();

    userName = getCookieValue("username");
    maxChars = data.maxChars;

    socket.emit("Join room", chatId);

    // replace with the name of the chat
    $(".chat-name").html(filterXSS(data.chatName))

    // limit length of message
    charCounterUpdate();

    // check every input
    $messageBox.bind('input propertychange', charCounterUpdate);

    // add messages to list
    refreshMessages(data.messages);

    // listen for message sending
    $("#send-message-button").click(sendMessage);
    $messageBox.keypress(function(e) {
      // space bar
      if (e.which == 13) {
        sendMessage();
        return false;
      }
    });

    // listen for incoming messages
    socket.on('message in', function(msg) {
      msg.time = getLocalTime(msg.time)
      buildAndAppendMessage(msg);

      // scroll to the end of the messages
      scrollToBottom($messageTableContainer);
    });



    // if an error during the request
  }).fail(handle_AJAX_error(showErrorMessage))
}) // end ready




function buildMessagehtml(obj, getSide = messageSide) {
  let time = obj.time
  let side = getSide(obj);
  let name = obj.username;
  return `<tr>
    <td>
      <div class="message ${side}">
        <div class="name">${filterXSS(name)}</div>
        <div class="content"></div>
        <span class="time">
          <sub>${time}
          </sub>
        </span>
      </div>
    </td>
  </tr>`;
}

function buildAndAppendMessage(obj, getSide = messageSide) {
  let messageHTMl = buildMessagehtml(obj, getSide);
  $msgTable.append(messageHTMl);
  $(".content").last().html(filterXSS(obj.content));
}

function refreshMessages(messages) {
  // delete contents
  $msgTable.html("");

  // loop through messages
  for (msg of messages) {

    // change time to local
    msg.time = getLocalTime(msg.time);

    // add to page
    buildAndAppendMessage(msg);
  }

  scrollToBottom($messageTableContainer);
}

function messageSide(obj) {
  if (obj.username === userName) {
    return "right"
  }
  return "left"
}

function sendMessage() {
  // get text and empty textbox
  let messageText = $messageBox.val();
  $messageBox.val("");

  // check if empty
  if (messageText === "") {
    return;
  }

  // reset character counter
  charCounterUpdate();

  msg = {};
  msg.content = messageText;
  msg.chatId = chatId;

  // send the text
  socket.emit("message out", msg);
}

// limits the number of characters
function limitTextLength($limitField, limitNum) {
  let value = $limitField.val()
  if (value.length > limitNum) {
    $limitField.val(value.substring(0, limitNum));
    return 0;
  } else {
    return limitNum - value.length;
  }
}

// updates character counter
function charCounterUpdate() {
  limitTextLength($messageBox, maxChars);
  $charactersCounter.text($messageBox.val().length + "/" + maxChars);
}

function scrollToBottom(ele, timeForScrolling = 500) {
  let height = ele[0].scrollHeight;
  ele.stop().animate({
    scrollTop: height
  }, timeForScrolling);
};

function showErrorMessage(text) {
  $errorMessage.fadeIn().html(text);
}