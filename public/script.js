// ========== GLOBAL VARIABLES ==========
let currentUser = null;
let authToken = null;
// Use environment variable or fallback to localhost for development
const API_BASE = window.API_BASE_URL || (window.location.origin + '/api');

// ========== TOAST NOTIFICATION SYSTEM ==========
function showToast(message, type = 'info', title = '') {
  const toastContainer = getOrCreateToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function getOrCreateToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

// ========== LOADING STATE MANAGEMENT ==========
function showLoading() {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';
  overlay.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Loading...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

// ========== AUTHENTICATION ==========
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUser').value;
      const password = document.getElementById('loginPass').value;

      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
          authToken = data.token;
          currentUser = data.user;
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          showToast('Welcome back!', 'success', 'Login Successful');
          document.getElementById('loginScreen').style.display = 'none';
          document.getElementById('mainApp').style.display = 'flex';
          initializeApp();
        } else {
          const errorMsg = document.getElementById('loginMsg');
          errorMsg.textContent = data.error || 'Login failed';
          errorMsg.style.display = 'block';
          showToast(data.error || 'Login failed', 'error', 'Login Error');
        }
      } catch (error) {
        const errorMsg = document.getElementById('loginMsg');
        errorMsg.textContent = 'Connection error. Make sure server is running.';
        errorMsg.style.display = 'block';
        showToast('Connection error. Make sure server is running.', 'error', 'Connection Error');
      }
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const username = document.getElementById('signupUser').value;
      const password = document.getElementById('signupPass').value;

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, username, password })
        });

        const data = await response.json();
        if (response.ok) {
          authToken = data.token;
          currentUser = data.user;
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          showToast('Account created successfully!', 'success', 'Registration Successful');
          document.getElementById('loginScreen').style.display = 'none';
          document.getElementById('mainApp').style.display = 'flex';
          initializeApp();
        } else {
          const errorMsg = document.getElementById('signupMsg');
          errorMsg.textContent = data.error || 'Registration failed';
          errorMsg.style.display = 'block';
          showToast(data.error || 'Registration failed', 'error', 'Registration Error');
        }
      } catch (error) {
        const errorMsg = document.getElementById('signupMsg');
        errorMsg.textContent = 'Connection error. Make sure server is running.';
        errorMsg.style.display = 'block';
        showToast('Connection error. Make sure server is running.', 'error', 'Connection Error');
      }
    });
  }

  // Check if user is already logged in
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    initializeApp();
  }
});

window.showSignup = function() {
  document.querySelector('.login-box').style.display = 'none';
  document.getElementById('signupBox').style.display = 'block';
};

window.showLogin = function() {
  document.getElementById('signupBox').style.display = 'none';
  document.querySelector('.login-box').style.display = 'block';
};

window.logout = function() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  authToken = null;
  currentUser = null;
  showToast('You have been logged out', 'info', 'Logout');
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
};

// ========== API HELPER ==========
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      showToast('Session expired. Please login again.', 'warning', 'Authentication');
      logout();
      return null;
    }

    // Check if response is JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // More specific error messages
    let errorMessage = 'Network error. Please try again.';
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = `Cannot connect to server at ${API_BASE}. Make sure the server is running.`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showToast(errorMessage, 'error', 'Connection Error');
    throw error;
  }
}

// ========== CONNECTION TEST ==========
async function testConnection() {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server connection successful:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    showToast(`Cannot connect to server. Please check if the server is running at ${API_BASE.replace('/api', '')}`, 'error', 'Connection Error');
    return false;
  }
}

// Test connection on page load
window.addEventListener('DOMContentLoaded', async () => {
  // Wait a bit for page to fully load
  setTimeout(async () => {
    await testConnection();
  }, 1000);
});

// ========== INITIALIZE APP ==========
function initializeApp() {
  if (currentUser) {
    document.getElementById('sidebarUserName').textContent = currentUser.name;
    document.getElementById('sidebarUserEmail').textContent = currentUser.email;
  }
  showSection('dashboard');
  loadDashboard();
}

// ========== NAVIGATION ==========
window.showSection = function(section) {
  // Smooth transition
  const currentSection = document.querySelector('.content-section.active');
  if (currentSection) {
    currentSection.style.opacity = '0';
    setTimeout(() => {
      document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      
      const targetSection = document.getElementById(section);
      targetSection.classList.add('active');
      targetSection.style.opacity = '0';
      setTimeout(() => {
        targetSection.style.opacity = '1';
      }, 50);
      
      event?.target?.closest('.nav-item')?.classList.add('active');
      
      switch(section) {
        case 'dashboard':
          loadDashboard();
          break;
        case 'contacts':
          loadContacts();
          break;
        case 'companies':
          loadCompanies();
          break;
        case 'deals':
          loadDeals();
          break;
        case 'tasks':
          loadTasks();
          break;
        case 'activities':
          loadActivities();
          break;
        case 'reports':
          loadReports();
          break;
        case 'calendar':
          loadCalendar();
          break;
      }
    }, 150);
  } else {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    event?.target?.closest('.nav-item')?.classList.add('active');

    switch(section) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'contacts':
        loadContacts();
        break;
      case 'companies':
        loadCompanies();
        break;
      case 'deals':
        loadDeals();
        break;
      case 'tasks':
        loadTasks();
        break;
      case 'activities':
        loadActivities();
        break;
      case 'reports':
        loadReports();
        break;
      case 'calendar':
        loadCalendar();
        break;
    }
  }
};

// ========== DASHBOARD ==========
async function loadDashboard() {
  const stats = await apiCall('/dashboard/stats');
  if (!stats) return;

  const statsGrid = document.getElementById('dashboardStats');
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-title">Total Contacts</span>
        <div class="stat-card-icon" style="background: #dbeafe; color: #2563eb;">
          <i class="fas fa-users"></i>
        </div>
      </div>
      <div class="stat-card-value">${stats.totalContacts}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-title">Total Companies</span>
        <div class="stat-card-icon" style="background: #d1fae5; color: #10b981;">
          <i class="fas fa-building"></i>
        </div>
      </div>
      <div class="stat-card-value">${stats.totalCompanies}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-title">Total Deals</span>
        <div class="stat-card-icon" style="background: #fef3c7; color: #f59e0b;">
          <i class="fas fa-handshake"></i>
        </div>
      </div>
      <div class="stat-card-value">${stats.totalDeals}</div>
    </div>
*** End Patch