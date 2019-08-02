$(document).ready(function() {

  // autocomplete
  $("#global-chat-search").autocomplete({
    source: requestForAutocomplete,
    minLength: 2,
    select: redirectToChatOptionsView,
    appendTo: ".chats-box"
  })

  // if there was a query
  let term = getCookieValue("chatSearchTerm");
  createCookie("chatSearchTerm", "", "expires = Thu, 01 Jan 1970 00:00:00 GMT")
  if (term !== undefined) {
    // search for a term and add it to the input field
    $("#global-chat-search").val(term).autocomplete("search");
  }
}) // end ready

function redirectToChatOptionsView(event, ui) {
  createCookie("chatIdToViewInfo", ui.item.id);
  createCookie("chatNameToViewInfo", ui.item.value);
  $("#global-chat-search").autocomplete("disable");
  redirect("chatInformation/");
}