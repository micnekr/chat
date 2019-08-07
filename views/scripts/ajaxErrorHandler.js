function handle_AJAX_error(showErrorMessage) {
  return function(xhr) {
    console.log(xhr);
    // if authentication  error
    if (xhr.status === 401) {
      return redirect("login/")
    } else if (xhr.status === 500) {
      return redirect("500_error/", "caused_by_ajax=true");
    } else {
      // if rate limit
      let aliasText = xhr.status === 429 ? xhr.responseText : undefined;

      let text = aliasText || xhr.statusText || ("Unknown error. Error code: " + xhr.status);
      showErrorMessage(text);
    }
  }
}