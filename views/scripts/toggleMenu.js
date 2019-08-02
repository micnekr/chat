let $menuContainer, $menuBarsContainer;

const refs = {
  logout: "logout/"
}

$(document).ready(function() {
  $menuContainer = $(".menu-container");
  $menuBarsContainer = $(".menu-bars-container");

  toggleMenu(0);

  $menuBarsContainer.click(function(evt) {
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
    redirect(refs[id]);
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