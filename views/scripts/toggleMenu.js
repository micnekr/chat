let $menuContainer, $menuIconContainer, $totalNotificationsNum, $manageChatsNotificationsNum, $manageChats;
let notificationsNum;

const refs = {
  logout: {
    ref: "logout/",
    ajax: false
  },
  manageChats: {
    ref: "manage_chats/",
    ajax: false
  },
  changeEmail: {
    ref: "change_email/",
    ajax: false
  }
}

const maxNotificationNum = 99;


$(document).ready(function() {
  $menuContainer = $(".menu-container");
  $menuIconContainer = $(".menu-icon-container");
  $totalNotificationsNum = $("#totalNotificationsNum");
  $manageChatsNotificationsNum = $("#manageChatsNotificationsNum");
  $manageChats = $("#manageChats");

  // show all notifications
  $.get("/getNotificationsNum", function(data) {
    notificationsNum = data;

    // show total number of notifications
    setNotification($totalNotificationsNum, notificationsNum.total);
    setNotification($manageChatsNotificationsNum, notificationsNum.chatAdmissionRequests);
  })

  //hide menu
  toggleMenu(0);

  $menuIconContainer.click(function(evt) {
    toggleMenu();
  })

  // so clicks inside the menu do not provoke its collapse
  $menuContainer.click(function(evt) {
    evt.stopPropagation();
  })

  //collapse menu on click outside
  $(document).click(function() {
    if (!$menuContainer.is(':animated') && $menuContainer.is(":visible")) toggleMenu();
  });




  // select ref
  $("#menu-aligner").on("click", "div", function() {
    let $this = $(this);
    let id = $this.attr('id');
    let redirectOptions = refs[id]
    if (!redirectOptions.ajax) {
      return redirect(redirectOptions.ref);
    }
  })
})

function toggleMenu(duration = 500) {
  $menuContainer.animate({
    width: "toggle",
    height: "toggle",
    padding: "toggle"
  }, {
    duration: duration,
    specialEasing: {
      width: "swing",
      height: "swing",
      padding: "swing"
    }
  })
}

function setNotification($notification, number) {
  if (number > 0) {
    // show if there are notifications
    $notification.show();

    // do not show more than maxNotificationNum notifications
    if (number > maxNotificationNum) {
      number = maxNotificationNum;
    }

    // show
    $notification.text(number);
  } else {
    // hide otherwise
    return $notification.hide();
  }
}