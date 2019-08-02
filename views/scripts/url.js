const host = window.location.origin + "/";

function url(path) {
  return host + path;
}

function redirect(path, params) {
  if (params) {
    path += "?" + params
  }
  window.location.href = url(path);
}