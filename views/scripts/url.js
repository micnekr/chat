const host = window.location.origin + "/";
let currentUrl = new URL(window.location.href);


function url(path) {
  return host + path;
}

function redirect(path, params) {
  if (params) {
    path += "?" + params
  }
  window.location.href = url(path);
}

function getSearchQuery(term) {
  return currentUrl.searchParams.get(term);
}