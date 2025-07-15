// script.js

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const username = document.getElementById('usernameInput').value.trim().toLowerCase();
      const pin = document.getElementById('pinInput').value.trim();
      const user = users.find(u => u.username.toLowerCase() === username && u.pin === pin);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
      } else {
        alert('Invalid username or PIN');
      }
    });
  }

  // Optional: Add basic protection to dashboard/admin (redirect if not logged in)
  if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('admin.html')) {
    if (!localStorage.getItem('user')) {
      window.location.href = 'index.html';
    }
  }
});
