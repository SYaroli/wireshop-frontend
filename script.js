// script.js (Extended for Catalog and Buttons)

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Login Logic (already working)
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = document.getElementById('usernameInput').value.trim().toLowerCase();
      const pin = document.getElementById('pinInput').value.trim();
      const foundUser = users.find(u => u.username.toLowerCase() === username && u.pin === pin);
      if (foundUser) {
        localStorage.setItem('user', JSON.stringify(foundUser));
        window.location.href = foundUser.role === 'admin' ? 'admin.html' : 'dashboard.html';
      } else {
        if (errorMessage) errorMessage.textContent = 'Invalid username or PIN';
        else alert('Invalid username or PIN');
      }
    });
  }

  // Protect Pages
  if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('admin.html')) {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
  }

  // Dashboard Specific
  if (window.location.pathname.endsWith('dashboard.html')) {
    document.getElementById('welcome-message').textContent = `Welcome, ${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`;

    // Populate Catalog
    const partSelect = document.getElementById('partSelect');
    catalog.forEach(item => {
      if (item.partNumber) { // Skip invalid entries
        const option = document.createElement('option');
        option.value = item.partNumber;
        option.textContent = `${item.partNumber} - ${item.name}`;
        partSelect.appendChild(option);
      }
    });

    // Update Fields on Part Change
    partSelect.addEventListener('change', () => {
      const selected = catalog.find(item => item.partNumber === partSelect.value);
      document.getElementById('expectedTime').value = selected ? `${selected.hours} hours` : '';
      document.getElementById('partNotes').value = selected ? selected.notes : '';
    });

    // Logs (using localStorage)
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const logTableBody = document.getElementById('logTableBody');
    function updateLogs() {
      logTableBody.innerHTML = '';
      logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${log.part}</td><td>${log.action}</td><td>${log.timestamp}</td><td>${log.notes}</td><td>${log.time || 'N/A'}</td>`;
        logTableBody.appendChild(row);
      });
    }
    updateLogs();

    // Submit Log Button
    document.getElementById('submitLog').addEventListener('click', () => {
      const part = partSelect.value;
      const action = document.getElementById('actionSelect').value;
      const notes = document.getElementById('notes').value;
      if (part && action) {
        logs.push({ part, action, timestamp: new Date().toLocaleString(), notes, time: '0h 0m 0s' }); // Add timer if needed
        localStorage.setItem('logs', JSON.stringify(logs));
        updateLogs();
      } else {
        alert('Select part and action.');
      }
    });

    // Delete Logs
    document.getElementById('deleteAllLogs').addEventListener('click', () => {
      localStorage.removeItem('logs');
      updateLogs();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });

    // Live View
    document.getElementById('liveViewBtn').addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }

  // Admin Specific
  if (window.location.pathname.endsWith('admin.html')) {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const activityTableBody = document.getElementById('activityTableBody');
    logs.forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${user.username}</td><td>${log.part}</td><td>${log.action}</td><td>${log.notes}</td><td>${log.time || 'N/A'}</td>`;
      activityTableBody.appendChild(row);
    });

    // Back Button
    document.getElementById('backToDashboard').addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});
