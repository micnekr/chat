function getCurrentTime() {
  let time = new Date();
  return formatTime(time);
}

// returns string based on Date object
function formatTime(time) {
  let hours = String(time.getHours());
  let mins = String(time.getMinutes());
  return addZero(hours) + ":" + addZero(mins);
}

// used to format time
function addZero(str) {
  if (str.length == 1) {
    return "0" + str;
  }
  return str;
}

// gets local time string from UNIX time
function getLocalTime(time) {
  return formatTime(new Date(time * 1000))
}