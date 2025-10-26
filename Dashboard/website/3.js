const form = document.getElementById("signinForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Temporary example: simple validation
    if(email === "test@example.com" && password === "123456") {
        message.style.color = "green";
        message.innerText = "Sign in successful!";
    } else {
        message.style.color = "red";
        message.innerText = "Invalid email or password.";
    }

    // Later, replace above with Firebase Authentication
});