const minGuessLogThreshold = 7;
const minPasswordSymbols = 8;

let $password, $password2, $errorMessage, $passwordWarning, $passwordFeedback, $passwordQualityProgressBarContainer, $passwordSuggestionsLabel, $passwordQualityProgressBar, $progressLabel;

$(document).ready(function () {
  // get csrf token
  let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  $password = $("#password");
  $password2 = $("#password2");

  $errorMessage = $(".errorMessage");

  $passwordWarning = $(".passwordWarning");
  $passwordFeedback = $(".passwordFeedback");

  $passwordQualityProgressBarContainer = $(".passwordQualityProgressBarContainer");
  $passwordQualityProgressBar = $("#passwordQualityProgressBar");
  $passwordSuggestionsLabel = $(".password-suggestions-label");
  $progressLabel = $(".progressLabel");

  $errorMessage.hide();
  $passwordWarning.hide();
  $passwordFeedback.hide();
  $passwordQualityProgressBarContainer.hide();
  $passwordSuggestionsLabel.hide();

  // check password strength on input change
  $password.on("input", function () {
    showFeedbackForPassword();
    $errorMessage.hide();
  });

  // password strength progress bar
  $passwordQualityProgressBar.progressbar({
    max: minGuessLogThreshold,
  });

    $("#submit").click((evt) => {
      evt.preventDefault();

      // definetely show feedback
      showFeedbackForPassword();

      // check if the password is too weak
      if (zxcvbn($password.val()).guesses_log10 < minGuessLogThreshold) {
        showErrorMessage("Your password is too weak.");
        return;
      }

      // check the password length
      if ($password.val().length < minPasswordSymbols) {
        return showErrorMessage(`The password should be at least ${minPasswordSymbols} symbols long.`);
      }

      // check if two passwords match
      if ($password.val() !== $password2.val()) {
        showErrorMessage("The two passwords do not match. Please, enter the passwords again.");
        $password.val("");
        $password2.val("");
        return;
      }

      console.log(getSearchQuery("token"))

      // send
      // post
      $.post(url("forgot_password_link"), {
        password: $password.val(),
        token: getSearchQuery("token"),
        _csrf: csrfToken
      }, function (data) {
        redirect("/login");
      }).fail(function (xhr) {
        handle_AJAX_error(showErrorMessage)(xhr);
      });

      return false;
    })
}); // end ready

function showErrorMessage(text) {
  $errorMessage.fadeIn().html(text);
}

function showPasswordSuggestingMessage($element, text) {

  //hide the message
  if (text === "" || text === undefined) {
    $element.fadeOut("slow");
  } else {
    $element.fadeIn("slow");
  }

  if (typeof (text) === "object") {
    text = text.join("<br />");
  }
  $element.html(text);
}

function showFeedbackForPassword() {

  // get password analysis
  let password = $password.val();
  let passwordAnalysisFeedback = zxcvbn(password);
  let passwordSuggestions = passwordAnalysisFeedback.feedback;

  // if the password is strong enough,
  if (passwordAnalysisFeedback.guesses_log10 >= minGuessLogThreshold) {

    // reset the progress bar and print "Done!"
    $progressLabel.text("Done!");
    $passwordQualityProgressBar.progressbar("value", 0);

    // reset the suggestions
    showPasswordSuggestingMessage($passwordWarning, "");
    showPasswordSuggestingMessage($passwordFeedback, "");

    return;

  } else {
    // else, reset the progress bar text
    $progressLabel.text("");
  }


  if (password !== "") {
    // show all labels
    $passwordSuggestionsLabel.fadeIn("slow");
    $passwordQualityProgressBarContainer.fadeIn("slow");
    showPasswordSuggestingMessage($passwordWarning, passwordSuggestions.warning);
    showPasswordSuggestingMessage($passwordFeedback, passwordSuggestions.suggestions + ["(These are not compulsory)"]);

    // refresh the progress bar
    $passwordQualityProgressBar.progressbar("value", passwordAnalysisFeedback.guesses_log10);
  } else {

    // empty all
    $passwordQualityProgressBarContainer.fadeOut("slow");
    $passwordSuggestionsLabel.fadeOut("slow");
    showPasswordSuggestingMessage($passwordWarning, "");
    showPasswordSuggestingMessage($passwordFeedback, "");
  }
}