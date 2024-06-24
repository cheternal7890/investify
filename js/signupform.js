const form = document.getElementById("form");
const username = document.getElementById("username");

function validate_password() {
    let password = document.getElementById("password").value;
    let toConfirmPassword = document.getElementById("password2").value;

    if(password != toConfirmPassword){
        document.getElementById("submit").disabled = true;
        document.getElementById("submit").style.opacity = (0.3);
    } else {
        document.getElementById("submit").disabled = false;
        document.getElementById("submit").style.opacity = (1);
    }
}