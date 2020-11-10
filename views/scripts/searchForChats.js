$(document).ready(function () {

    // autocomplete
    $("#global-chat-search").autocomplete({
        source: requestForAutocomplete,
        minLength: 2,
        select: redirectToChatOptionsView,
        appendTo: ".chats-box"
    });

    // if there was a query
    let term = getSearchQuery("term");
    if (term !== undefined) {
        // search for a term and add it to the input field
        $("#global-chat-search").val(term).autocomplete("search");
    }
}); // end ready

function redirectToChatOptionsView(event, ui) {
    $("#global-chat-search").autocomplete("disable");
    redirect("chat_information/", `chatId=${ui.item.id}&name=${ui.item.label}`);
}