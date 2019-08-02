function handle_AJAX_error(showErrorMessage) {
  return function(xhr) {
    // if authentication  error
    if (xhr.status === 401) {
      return redirect("login/")
    } else if (xhr.status === 500) {
      return redirect("500_error/", "caused_by_ajax=true");
    } else {
      let text = xhr.statusText || ("Unknown error. Error code: " + xhr.status);
      showErrorMessage(text);
    }
  }
}