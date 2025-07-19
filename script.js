document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const API_URL = 'https://wireshop-backend.onrender.com/api/jobs';

  // Login Logic
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
        errorMessage.textContent = 'Invalid username or PIN';
      }
    });
  }

  // Protect Pages
  if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('admin.html')) {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
  }

  // Dashboard Page Logic
  if (window.location.pathname.includes('dashboard.html')) {
    document.getElementById('welcome-message').textContent =
      `Welcome, ${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`;

    const partSelect = document.getElementById('partSelect');
    const partInfo = document.getElementById('partInfo');
    const actionSelect = document.getElementById('actionSelect');
    const notesInput = document.getElementById('notes');
    const logTableBody = document.getElementById('logTableBody');

    catalog.forEach(item => {
      if (item.partNumber) {
        const option = document.createElement('option');
        option.value = item.partNumber;
        option.textContent = `${item.partNumber} - ${item.name}`;
        partSelect.appendChild(option);
      }
    });

   partSelect.addEventListener('change', () => {
  const selected = catalog.find(item => item.partNumber === partSelect.value);
  if (selected) {
    partInfo.textContent = `Expected Time: ${selected.hours} hours\nNotes: ${selected.notes}`;
  } else {
    partInfo.textContent = 'Expected Time: -- hours\nNotes: --';
  }
});

    async function fetchLogs() {
      try {
        const res = await fetch(`${API_URL}/logs/${user.username}`);
        const data = await res.json();
        renderLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    }

    function renderLogs(logs) {
      logTableBody.innerHTML = '';
      logs.forEach(log => {
        const row = document.createElement('tr');
        const duration = calculateDuration(log.startTime, log.endTime);
        row.innerHTML = `
          <td>${log.partNumber}</td>
          <td>${log.action}</td>
          <td>${formatTimestamp(log.startTime)}</td>
          <td>${log.note || ''}</td>
          <td>${duration}</td>
        `;
        logTableBody.appendChild(row);
      });
    }

    function formatTimestamp(ts) {
      if (!ts) return 'N/A';
      const date = new Date(ts);
      return date.toLocaleString();
    }

    function calculateDuration(start, end) {
      if (!start || !end) return 'N/A';
      const duration = end - start;
      const h = Math.floor(duration / 3600000);
      const m = Math.floor((duration % 3600000) / 60000);
      const s = Math.floor((duration % 60000) / 1000);
      return `${h}h ${m}m ${s}s`;
    }

    document.getElementById('submitLog').addEventListener('click', async () => {
      const partNumber = partSelect.value;
      const action = actionSelect.value;
      const note = notesInput.value;

      if (!partNumber || !action) {
        alert('Select part and action.');
        return;
      }

      const now = Date.now();
      const payload = {
        username: user.username,
        partNumber,
        action,
        note,
        startTime: (action === 'Start' || action === 'Continue') ? now : null,
        endTime: (action === 'Pause' || action === 'Finish') ? now : null
      };

      try {
        const res = await fetch(`${API_URL}/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const raw = await res.text();
          console.error('Server responded with:', raw);
          throw new Error(`Server error: ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          fetchLogs();
        } else {
          alert('Failed to save log.');
        }
      } catch (err) {
        console.error('Error logging job:', err.message || err);
        alert("Error logging job. Check console for details.");
      }
    });

    document.getElementById('deleteAllLogs').addEventListener('click', () => {
      alert('Delete all is disabled for now. Use DB admin tools.');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });

    document.getElementById('liveViewBtn').addEventListener('click', () => {
      window.location.href = 'admin.html';
    });

    fetchLogs();
  }

  // Admin Page
  if (window.location.pathname.includes('admin.html')) {
    const activityTableBody = document.getElementById('activityTableBody');

    fetch(`${API_URL}/logs`)
      .then(res => res.json())
      .then(logs => {
        logs.forEach(log => {
          const row = document.createElement('tr');
          const duration = log.startTime && log.endTime
            ? calculateDuration(log.startTime, log.endTime)
            : 'N/A';
          row.innerHTML = `
            <td>${log.username}</td>
            <td>${log.partNumber}</td>
            <td>${log.action}</td>
            <td>${log.note || ''}</td>
            <td>${duration}</td>
          `;
          activityTableBody.appendChild(row);
        });
      })
      .catch(err => {
        console.error('Failed to load admin logs:', err);
      });

    function calculateDuration(start, end) {
      if (!start || !end) return 'N/A';
      const duration = end - start;
      const h = Math.floor(duration / 3600000);
      const m = Math.floor((duration % 3600000) / 60000);
      const s = Math.floor((duration % 60000) / 1000);
      return `${h}h ${m}m ${s}s`;
    }

    document.getElementById('backToDashboard').addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});