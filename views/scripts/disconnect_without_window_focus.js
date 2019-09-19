// needs window focused plugin

const maxTimeBlur = 15 * 60 * 1000;
let lastTimeBlur = null;

const rememberMe = getCookieValue("rememberMe");

// for IE8
if (!Date.now) {
  Date.now = function() {
    return new Date().getTime();
  }
}

// if do need to log out
if (rememberMe === "false") {
  // go to login if blurs away for too long
  $.winFocus(function(event) {
      //blur
      lastTimeBlur = Date.now();
    },
    function(event) {
      //focus
      if (lastTimeBlur + maxTimeBlur < Date.now() && lastTimeBlur !== null) {
        // hide the page
        $(".page_container").hide();
        redirect("login/");
      } else {
        lastTimeBlur = null;
      }
    });
}