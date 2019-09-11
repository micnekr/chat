const minGuessLogThreshold = 7;
const minPasswordSymbols = 8;
const maxUsernameSymbols = 15;
const maxEmailSymbols = 254;
const usernameRegex = /^[a-zA-Z0-9\s_]*$/;
const emailValidator_re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


let $form, $username, $password, $password2, $email, $submit, $passwordWarning, $passwordFeedback, $passwordQualityProgressBar, $passwordQualityProgressBarContainer, $progressLabel, $passwordSuggestionsLabel, $errorMessage;

$(document).ready(function() {

  $form = $("#form");

  $username = $("#username");
  $password = $("#password");
  $password2 = $("#password2");
  $email = $("#email");
  $submit = $("#submit");

  $passwordWarning = $(".passwordWarning");
  $passwordFeedback = $(".passwordFeedback");
  $passwordQualityProgressBar = $("#passwordQualityProgressBar");
  $passwordSuggestionsLabel = $(".password-suggestions-label");
  $passwordQualityProgressBarContainer = $(".passwordQualityProgressBarContainer");
  $progressLabel = $(".progressLabel");
  $errorMessage = $(".errorMessage");

  $errorMessage.hide();
  $passwordWarning.hide();
  $passwordFeedback.hide();
  $passwordQualityProgressBarContainer.hide();
  $passwordSuggestionsLabel.hide();


  // check password strength on input change
  $password.on("input", function() {
    showFeedbackForPassword();
    $errorMessage.hide();
  });

  // password strength progress bar
  $passwordQualityProgressBar.progressbar({
    max: minGuessLogThreshold,
  });

  // on form submit, conduct checks
  $form.submit(function(evt) {
    evt.preventDefault();

    // definetely show feedback
    showFeedbackForPassword();

    // check if the username is acceptable
    if (!usernameRegex.test($username.val())) {
      return showErrorMessage("A username can only contain english alphabet letters, numbers, spaces and undersores.");
    }

    // check if the password is too weak
    if (zxcvbn($password.val()).guesses_log10 < minGuessLogThreshold) {
      showErrorMessage("Your password is too weak.");
      return;
    }

    // check the password length
    if ($password.val().length < minPasswordSymbols) {
      return showErrorMessage(`The password should be at least ${minPasswordSymbols} symbols long.`);
    }

    // check the username length
    if ($username.val().length > maxUsernameSymbols) {
      return showErrorMessage(`The username should not be longer than ${maxUsernameSymbols} symbols long.`);
    }

    // check email length
    if ($email.val().length > maxEmailSymbols) {
      return showErrorMessage(`An email should not be longer than ${maxEmailSymbols} symbols long`);
    }

    // if an email has a wrong syntax
    if (!emailValidator_re.test(String($email.val()).toLowerCase())) {
      return showErrorMessage("This email seems to be incorrect. Please, check it again.");
    }

    // check if two passwords match
    if ($password.val() !== $password2.val()) {
      showErrorMessage("The two passwords do not match. Please, enter the passwords again.");
      $password.val("");
      $password2.val("");
      return;
    }

    let token = grecaptcha.getResponse();

    if (!token) {
      return showErrorMessage("Please, click the checkbox");
    }

    // post
    $.post(url("signUp"), {
      username: $username.val(),
      password: $password.val(),
      email: $email.val(),
      captchaToken: token
    }, function(data) {
      redirect("/login");
    }).fail(function(xhr) {
      grecaptcha.reset();
      handle_AJAX_error(showErrorMessage)(xhr);
    });

    return false;
  })
}) // end ready

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

  if (typeof(text) === "object") {
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
    showPasswordSuggestingMessage($passwordFeedback, passwordSuggestions.suggestions);

    // refresh the progress bar
    $passwordQualityProgressBar.progressbar("value", passwordAnalysisFeedback.guesses_log10);
  } else {

    // empty all
    $passwordQualityProgressBarContainer.fadeOut("slow");
    $passwordSuggestionsLabel.fadeOut("slow");
    showPasswordSuggestingMessage($passwordWarning);
    showPasswordSuggestingMessage($passwordFeedback);
  }
}