function createCookie(name, value, options = "") {

    // add a semicolon if needed
    if (options !== "") {
        value += ";";
    }
    document.cookie = name + "=" + value + options + "; path=/";
}

// reads cookie value
function getCookieValue(a) {
    var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}