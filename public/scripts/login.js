$(document).ready(function () {
  const form = $("#loginForm");
  const passwordInput = $("#password");
  const loading = $(".loading");
  const togglePassword = $(".toggle-password");
  const errorMessage = $(".error-message");

  togglePassword.on("click", function () {
    const type =
      passwordInput.attr("type") === "password" ? "text" : "password";
    passwordInput.attr("type", type);
    $(this).text(type === "password" ? "👁️" : "👁️‍🗨️");
  });

  form.on("submit", function (event) {
    event.preventDefault();
    loading.show();
    setTimeout(() => {
      $.ajax({
        type: "POST",
        url: form.attr("action"),
        data: form.serialize(),
        success: function (response) {
          const role = response.role;
          if (role === "admin") {
            window.location.href = "/admin";
          } else if (role === "student") {
            window.location.href = `/student?id=${response.id}`;
          } else if (role === "guard") {
            window.location.href = `/guard?id=${response.id}`;
          } else {
            errorMessage
              .html("<p>Incorrect password or ID, try again!</p>")
              .fadeIn()
              .delay(500)
              .fadeOut();
          }
        },
        error: function () {
          errorMessage
            .html("<p>Incorrect password or ID, try again!</p>")
            .fadeIn()
            .delay(500)
            .fadeOut();
        },
        complete: function () {
          loading.hide();
        },
      });
    }, 500);
  });
});
