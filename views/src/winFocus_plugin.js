/*    Begin Plugin    */ ;;
(function($) {
  $.winFocus || ($.extend({
    winFocus: function() {
      var a = !0,
        b = [];
      $(document).data("winFocus") || $(document).data("winFocus", $.winFocus.init());
      for (x in arguments) "object" == typeof arguments[x] ? (arguments[x].blur && $.winFocus.methods.blur.push(arguments[x].blur), arguments[x].focus && $.winFocus.methods.focus.push(arguments[x].focus), arguments[x].blurFocus && $.winFocus.methods.blurFocus.push(arguments[x].blurFocus), arguments[x].initRun && (a = arguments[x].initRun)) : "function" == typeof arguments[x] ? b.push(arguments[x]) :
        "boolean" == typeof arguments[x] && (a = arguments[x]);
      b && (1 == b.length ? $.winFocus.methods.blurFocus.push(b[0]) : ($.winFocus.methods.blur.push(b[0]), $.winFocus.methods.focus.push(b[1])));
      if (a) $.winFocus.methods.onChange()
    }
  }), $.winFocus.init = function() {
    $.winFocus.props.hidden in document ? document.addEventListener("visibilitychange", $.winFocus.methods.onChange) : ($.winFocus.props.hidden = "mozHidden") in document ? document.addEventListener("mozvisibilitychange", $.winFocus.methods.onChange) : ($.winFocus.props.hidden =
      "webkitHidden") in document ? document.addEventListener("webkitvisibilitychange", $.winFocus.methods.onChange) : ($.winFocus.props.hidden = "msHidden") in document ? document.addEventListener("msvisibilitychange", $.winFocus.methods.onChange) : ($.winFocus.props.hidden = "onfocusin") in document ? document.onfocusin = document.onfocusout = $.winFocus.methods.onChange : window.onpageshow = window.onpagehide = window.onfocus = window.onblur = $.winFocus.methods.onChange;
    return $.winFocus
  }, $.winFocus.methods = {
    blurFocus: [],
    blur: [],
    focus: [],
    exeCB: function(a) {
      $.winFocus.methods.blurFocus && $.each($.winFocus.methods.blurFocus, function(b, c) {
        this.apply($.winFocus, [a, !a.hidden])
      });
      a.hidden && $.winFocus.methods.blur && $.each($.winFocus.methods.blur, function(b, c) {
        this.apply($.winFocus, [a])
      });
      !a.hidden && $.winFocus.methods.focus && $.each($.winFocus.methods.focus, function(b, c) {
        this.apply($.winFocus, [a])
      })
    },
    onChange: function(a) {
      var b = {
        focus: !1,
        focusin: !1,
        pageshow: !1,
        blur: !0,
        focusout: !0,
        pagehide: !0
      };
      if (a = a || window.event) a.hidden = a.type in b ? b[a.type] :
        document[$.winFocus.props.hidden], $(window).data("visible", !a.hidden), $.winFocus.methods.exeCB(a);
      else try {
        $.winFocus.methods.onChange.call(document, new Event("visibilitychange"))
      } catch (c) {}
    }
  }, $.winFocus.props = {
    hidden: "hidden"
  })
})(jQuery);
/*    End Plugin      */