const form = document.querySelector("#form");

const submitButton = document.querySelector("#submit");

function validate(event) {
  event.preventDefault();

  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  if (username === "test" && password === "test") {
    alert("Login successful");
    window.location.assign("/dashboard");
  } else {
    alert("Incorrect");
  }
}

submitButton.addEventListener("click", validate);
