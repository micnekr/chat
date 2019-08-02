const maxSuggestions = 10;

$(document).ready(function() {

  // set limit
  autocompleteOptions.limit = maxSuggestions;

  // autocomplete
  $("#global-chat-search").autocomplete({
    source: requestForAutocomplete,
    minLength: 2,
    select: redirectToChatOptionsView
  })

  //redirect on enter
  $("#global-chat-search").on('keypress', function(e) {
    if (e.which === 13) {
      // redirect to view the text in the input box
      redirectToAllResultsPageLink($(this).val());
    }
  });

  // table which centers chat suggestions
  let chatsRefsAligner = $("#chats-aligner");

  // when a chat ref is clicked, redirect
  chatsRefsAligner.on("click", "div", function() {
    let $this = $(this);
    let id = $this.attr('id');
    createCookie("chatId", id);
    redirect("chat/");
  });

  // get all chat refs
  $.post(url("allChats/"), (data) => {

    // sort them and display
    data.sort(sortByNumberOfPeople);
    addRefs(data, chatsRefsAligner)
  }).fail(handle_AJAX_error(showErrorMessage))


  // when the button to create a chat is pressed, redirect
  $("button.create-chat").click(() => {
    redirect("createChat/");
  })
}) // end ready

// makes html for chat ref
function buildChatRef(object) {
  return `<tr><td><div class="chat-ref pointer" id="${object.id}">${object.name}</div></td></tr>`
}

// adds all chat refs
function addRefs(chats, chatsRefsAligner) {
  for (chat of chats) {
    chatsRefsAligner.append(buildChatRef(chat));
  }
}

function redirectToChatOptionsView(event, ui) {
  // if it is the option to see more, redirect to search page
  if (ui.item.isSeeMoreOption) {
    return redirectToAllResultsPageLink(ui.item.searchQuery);
  }
  createCookie("chatIdToViewInfo", ui.item.id);
  createCookie("chatNameToViewInfo", ui.item.value);
  $("#global-chat-search").autocomplete("disable");
  redirect("chatInformation/");
}

function redirectToAllResultsPageLink(searchQuery) {
  createCookie("chatSearchTerm", searchQuery)
  return redirect("searchForChats");
}