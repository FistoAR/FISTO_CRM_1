document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const empIdField = document.getElementById("employeeid");
  const passwordField = document.getElementById("password");
  const toggleButton = document.getElementById("toggle-password");
  const eyeOffIcon = toggleButton?.querySelector(".eye-off-icon");
  const eyeIcon = toggleButton?.querySelector(".eye-icon");

  // Handle login form submit
  loginForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const empId = empIdField?.value.trim();
    const password = passwordField?.value.trim();

    if (!empId || !password) {
      showAlert("Please enter both Employee ID and password", "error");
      return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (!submitButton || submitButton.disabled) return;

    const originalText = submitButton.textContent;
    submitButton.textContent = "Logging in...";
    submitButton.disabled = true;

    try {
      const response = await fetch('https://www.fist-o.com/web_crm/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `employeeid=${encodeURIComponent(empId)}&password=${encodeURIComponent(password)}`
      });

      const responseText = await response.text();
      console.log("🔍 Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error("Invalid server response. Contact admin.");
      }

      if (data.status === 'success') {
        const user = data.user;
        sessionStorage.setItem("employeeId", user.employee_id);
        sessionStorage.setItem("employeeName", user.employee_name);
        sessionStorage.setItem("designation", user.designation);
        sessionStorage.setItem("dob", user.dob);
        sessionStorage.setItem("dateofjoin", user.dateofjoin);
        sessionStorage.setItem("addres", user.Addres);
        sessionStorage.setItem("mail", user.mail);
        sessionStorage.setItem("gender", user.gender);
        sessionStorage.setItem("phone", user.Phone);
        sessionStorage.setItem("loginTime", new Date().toISOString());

        sessionStorage.setItem("currentUser", JSON.stringify({
          employee_id: user.employee_id,
          employee_name: user.employee_name,
          designation: user.designation,
          dob: user.dob,
          dateofjoin: user.dateofjoin,
          Addres: user.Addres,
          mail: user.mail,
          gender: user.gender,
          Phone: user.Phone,
          loginTime: new Date().toISOString()
        }));

        showAlert("Login successful! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showAlert(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      showAlert("Login failed. Please try again later.", "error");
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });

  // Password toggle
  if (passwordField && toggleButton) {
    passwordField.type = "password";
    eyeIcon && (eyeIcon.style.display = "none");
    eyeOffIcon && (eyeOffIcon.style.display = "block");

    toggleButton.addEventListener("click", () => {
      const isPassword = passwordField.type === "password";
      passwordField.type = isPassword ? "text" : "password";

      if (eyeIcon && eyeOffIcon) {
        eyeIcon.style.display = isPassword ? "block" : "none";
        eyeOffIcon.style.display = isPassword ? "none" : "block";
      }
    });
  }

  // Submit on Enter key
  [empIdField, passwordField].forEach(field => {
    field?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        loginForm.dispatchEvent(new Event("submit"));
      }
    });
  });

  // Lazy load image (optional background/logo)
  const img = document.querySelector(".lazyload");
  if (img && img.dataset.src) {
    const fullSrc = img.dataset.src;
    const highRes = new Image();
    highRes.src = fullSrc;

    highRes.onload = () => {
      img.src = fullSrc;
      img.classList.add("loaded");
    };

    highRes.onerror = () => {
      console.warn("Failed to load image:", fullSrc);
    };
  }
});

// Unified alert system
function showAlert(message, type = "info") {
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) existingAlert.remove();

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    transition: opacity 0.3s ease;
    background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
  `;

  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 4000);
}
1