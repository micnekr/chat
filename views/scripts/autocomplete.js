let autocompleteOptions = {
  limit: 0
};

let $errorMessage;

$(document).ready(function() {
  $errorMessage = $(".autocomplete-error-message").hide();
})

function requestForAutocomplete(request, response) {
  $errorMessage.fadeOut();
  $.ajax({
    url: url("chatSearch"),
    data: {
      term: request.term.toLowerCase()
    },
    success: function(data) {
      // sort the data
      data.sort(sortByNumberOfPeople);

      // construct an array of objects jquery expects
      names = [];
      for (let i = 0; i < data.length; i++) {
        let name = data[i].name;
        let nameWithoutHTML;
        if (name) {
          // delete all html tags
          nameWithoutHTML = name.replace(/<[^>]*>/g, "")
        }
        names.push({
          label: name,
          value: nameWithoutHTML,
          id: data[i].id
        });
      }

      // slice if the list is too long
      if (autocompleteOptions.limit !== 0 && names.length >
        autocompleteOptions.limit) {
        names = names.slice(0, maxSuggestions);
        names.push({
          label: "See more suggestions",
          value: "See more suggestions",
          searchQuery: $("#global-chat-search").val(),
          isSeeMoreOption: true
        })
      }
      response(names);
    }
  }).fail(handle_AJAX_error(showErrorMessage));
}

function showErrorMessage(text) {
  $errorMessage.fadeIn().html(text);
}

function sortByNumberOfPeople(a, b) {
  return b.num_of_users - a.num_of_users
}