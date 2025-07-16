// script.js

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Login Logic (for index.html)
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

  // Redirect if not logged in on protected pages
  if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('admin.html')) {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
  }

  // Dashboard Logic
  if (window.location.pathname.endsWith('dashboard.html')) {
    // Populate welcome
    document.getElementById('welcome-message').textContent = `Welcome, ${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`;

    // Populate part select from catalog.js
    const partSelect = document.getElementById('partSelect');
    catalog.forEach(item => {
      const option = document.createElement('option');
      option.value = item.partNumber;
      option.textContent = `${item.partNumber} - ${item.name}`;
      partSelect.appendChild(option);
    });

    // Update expected time and notes on part change
    partSelect.addEventListener('change', () => {
      const selectedPart = catalog.find(item => item.partNumber === partSelect.value);
      if (selectedPart) {
        document.getElementById('expectedTime').value = `${selectedPart.hours} hours`;
        document.getElementById('partNotes').value = selectedPart.notes;
      } else {
        document.getElementById('expectedTime').value = '';
        document.getElementById('partNotes').value = '';
      }
    });

    // Load and display logs
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const logTableBody = document.getElementById('logTableBody');
    function updateLogTable() {
      logTableBody.innerHTML = '';
      logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${log.partNumber}</td>
          <td class="${log.action === 'Pause' ? 'action-pause' : ''}">${log.action}</td>
          <td>${log.timestamp}</td>
          <td>${log.notes}</td>
          <td>${log.totalTime || 'N/A'}</td>
        `;
        logTableBody.appendChild(row);
      });
    }
    updateLogTable();

    // Submit Log
    document.getElementById('submitLog').addEventListener('click', () => {
      const partNumber = partSelect.value;
      const action = document.getElementById('actionSelect').value;
      const notes = document.getElementById('notes').value;
      if (partNumber && action) {
        const newLog = {
          partNumber,
          action,
          timestamp: new Date().toLocaleString(),
          notes,
          totalTime: '0h 0m 0s' // Placeholder; add timer logic if needed
        };
        logs.push(newLog);
        localStorage.setItem('logs', JSON.stringify(logs));
        updateLogTable();
        document.getElementById('notes').value = ''; // Clear notes
      } else {
        alert('Select part and action');
      }
    });

    // Delete All Logs
    document.getElementById('deleteAllLogs').addEventListener('click', () => {
      localStorage.removeItem('logs');
      logs.length = 0;
      updateLogTable();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });

    // Live View (redirect to admin)
    document.getElementById('liveViewBtn').addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }

  // Admin Logic (Show logs as activity)
  if (window.location.pathname.endsWith('admin.html')) {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const activityTableBody = document.getElementById('activityTableBody');
    logs.forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.username}</td> <!-- Client-side: shows current user; backend needed for multi-user -->
        <td>${log.partNumber}</td>
        <td>${log.action}</td>
        <td>${log.notes}</td>
        <td>${log.totalTime || 'N/A'}</td>
      `;
      activityTableBody.appendChild(row);
    });

    // Back to Dashboard
    document.getElementById('backToDashboard').addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});
