function isValidEmail(email) {
  var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return pattern.test(email);
}

function isValidAnswer(answer) {
  var pattern = /^[a-zA-Z0-9.!@#$%^&*()_+-,/\\'"<>:`~?{}| ]{5,}$/;
  return pattern.test(answer);
}

function isValidUsername(username) {
  var pattern = /^[a-zA-Z0-9._-]{2,}$/;
  return pattern.test(username);
}

export default {
  isValidEmail: isValidEmail,
  isValidAnswer: isValidAnswer,
  isValidUsername: isValidUsername
}