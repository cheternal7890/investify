const form = document.getElementById("form");
const username = document.getElementById("username");

let updateLabel = document.getElementById("updateLabel")

function validate_password() {
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("password2").value;
  let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

  let isPasswordStrong = false;

  const passwordCheck = regex.test(password)

  if(passwordCheck){
      isPasswordStrong = true
  }

  // Basic behavior default to normal
  if(password == "" && confirmPassword == ""){
    updateLabel.innerHTML = ""
    document.getElementById("submit").disabled = false;
    document.getElementById("submit").style.opacity = (1);
  }

  // If the password is not strong, inform the user
  if(!isPasswordStrong){
    document.getElementById("submit").disabled = true;
    document.getElementById("submit").style.opacity = (0.50);
    document.getElementById("updateLabel").style.color = "#CC3300";
    updateLabel.innerHTML = "Please use a combination of uppercase and lowercase letters, a special character, a number, and 8 or more characters"

  // Else, tell the user that the password works
  } else {
    updateLabel.innerHTML = "That works!"
    updateLabel.style.color = "#009900"
  }

  // If the password is strong and both passwords match, then the user can submit
  if(password == confirmPassword && isPasswordStrong){
    document.getElementById("submit").disabled = false;
    document.getElementById("submit").style.opacity = (1);
  }

}