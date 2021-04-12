const passwordField = document.getElementById("password") as HTMLInputElement;
const errorLabel = document.getElementById("errorLabel") as HTMLLabelElement;
const loginForm = document.getElementById("loginForm") as HTMLFormElement;

async function login() {
  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"password":"${passwordField.value}"}`,
    });
    if (res.ok) {
      location.href = "/admin";
    } else {
      errorLabel.innerText = "Incorrect Password";
      errorLabel.classList.remove("hidden");
    }
  } catch (error) {
    errorLabel.innerText = "No Internet Connection";
    errorLabel.classList.remove("hidden");
  }
}

loginForm.onsubmit = login;

export {};
