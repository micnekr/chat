let currentUrl = new URL(window.location.href);

$(document).ready(function() {

  $("#return").click(() => {
    // if it is necessary to go back 2 times
    if (currentUrl.searchParams.get("caused_by_ajax") === "true") {
      // it was an ajax call, so go back 2 times
      window.history.go(-2);
    } else {
      window.history.back();
    }
  })
}) // end ready