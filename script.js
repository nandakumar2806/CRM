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
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-title">Total Revenue</span>
        <div class="stat-card-icon" style="background: #fce7f3; color: #ec4899;">
          <i class="fas fa-dollar-sign"></i>
        </div>
      </div>
      <div class="stat-card-value">$${formatNumber(stats.totalRevenue)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-title">Won Deals</span>
        <div class="stat-card-icon" style="background: #d1fae5; color: #10b981;">
          <i class="fas fa-trophy"></i>
        </div>
      </div>
      <div class="stat-card-value">${stats.wonDeals}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-title">Conversion Rate</span>
        <div class="stat-card-icon" style="background: #e0e7ff; color: #6366f1;">
          <i class="fas fa-percentage"></i>
        </div>
      </div>
      <div class="stat-card-value">${stats.conversionRate}%</div>
    </div>
  `;

  // Load recent activities
  const activities = await apiCall('/activities');
  if (activities) {
    const recentActivities = activities.slice(0, 5);
    document.getElementById('recentActivities').innerHTML = recentActivities.map(a => `
      <div class="activity-item">
        <div class="activity-icon" style="background: #dbeafe; color: #2563eb;">
          <i class="fas fa-${getActivityIcon(a.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-header">
            <span class="activity-subject">${a.subject}</span>
            <span class="activity-time">${formatTimeAgo(a.createdAt)}</span>
          </div>
          <div class="activity-description">${a.description || ''}</div>
        </div>
      </div>
    `).join('') || '<p style="color: #64748b; text-align: center; padding: 20px;">No recent activities</p>';
  }

  // Load upcoming tasks
  const tasks = await apiCall('/tasks');
  if (tasks) {
    const upcoming = tasks.filter(t => t.status !== 'Completed').slice(0, 5);
    document.getElementById('upcomingTasks').innerHTML = upcoming.map(t => `
      <div class="task-item">
        <input type="checkbox" class="task-checkbox" ${t.status === 'Completed' ? 'checked' : ''} onchange="toggleTaskStatus('${t.id}')">
        <div class="task-content">
          <div class="task-title">${t.title}</div>
          <div class="task-meta">
            <span class="priority-badge priority-${t.priority?.toLowerCase() || 'medium'}">${t.priority || 'Medium'}</span>
            ${t.dueDate ? `<span>Due: ${formatDate(t.dueDate)}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('') || '<p style="color: #64748b; text-align: center; padding: 20px;">No upcoming tasks</p>';
  }

  // Load deal pipeline summary
  const deals = await apiCall('/deals');
  if (deals) {
    const pipelineData = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + parseFloat(deal.value || 0);
      return acc;
    }, {});

    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won'];
    document.getElementById('dealPipeline').innerHTML = stages.map(stage => `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 12px; color: #64748b;">${stage}</span>
          <span style="font-size: 12px; font-weight: 600;">$${formatNumber(pipelineData[stage] || 0)}</span>
        </div>
        <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
          <div style="height: 100%; width: ${(pipelineData[stage] || 0) / Math.max(...Object.values(pipelineData), 1) * 100}%; background: #2563eb;"></div>
        </div>
      </div>
    `).join('') || '<p style="color: #64748b; text-align: center; padding: 20px;">No deals in pipeline</p>';
  }
}

window.refreshDashboard = function() {
  loadDashboard();
};

// ========== CONTACTS ==========
async function loadContacts() {
  const contacts = await apiCall('/contacts');
  if (!contacts) return;

  const tbody = document.getElementById('contactsTableBody');
  tbody.innerHTML = contacts.map(contact => `
    <tr>
      <td>${contact.firstName || ''} ${contact.lastName || ''}</td>
      <td>${contact.email || ''}</td>
      <td>${contact.phone || '-'}</td>
      <td>${contact.company || '-'}</td>
      <td><span class="status-badge status-${(contact.status || 'active').toLowerCase()}">${contact.status || 'Active'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon btn-edit" onclick="editContact('${contact.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-delete" onclick="deleteContact('${contact.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.openContactModal = function(contactId = null) {
  const modal = document.getElementById('contactModal');
  const form = document.getElementById('contactForm');
  const title = document.getElementById('contactModalTitle');

  if (contactId) {
    title.textContent = 'Edit Contact';
    // Load contact data
    apiCall(`/contacts`).then(contacts => {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        document.getElementById('contactFirstName').value = contact.firstName || '';
        document.getElementById('contactLastName').value = contact.lastName || '';
        document.getElementById('contactEmail').value = contact.email || '';
        document.getElementById('contactPhone').value = contact.phone || '';
        document.getElementById('contactCompany').value = contact.company || '';
        document.getElementById('contactJobTitle').value = contact.jobTitle || '';
        document.getElementById('contactStatus').value = contact.status || 'Active';
        form.dataset.contactId = contactId;
      }
    });
  } else {
    title.textContent = 'Add Contact';
    form.reset();
    delete form.dataset.contactId;
  }

  modal.classList.add('active');
};

window.saveContact = async function(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const contactId = form.dataset.contactId;
  const submitBtn = form.querySelector('button[type="submit"]');

  const data = {
    firstName: document.getElementById('contactFirstName').value,
    lastName: document.getElementById('contactLastName').value,
    email: document.getElementById('contactEmail').value,
    phone: document.getElementById('contactPhone').value,
    company: document.getElementById('contactCompany').value,
    jobTitle: document.getElementById('contactJobTitle').value,
    status: document.getElementById('contactStatus').value
  };

  // Form validation
  if (!data.firstName || !data.lastName || !data.email) {
    showToast('Please fill in all required fields', 'error', 'Validation Error');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    if (contactId) {
      await apiCall(`/contacts/${contactId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      showToast('Contact updated successfully', 'success', 'Success');
    } else {
      await apiCall('/contacts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      showToast('Contact created successfully', 'success', 'Success');
    }
    closeModal('contactModal');
    loadContacts();
    if (document.getElementById('dashboard').classList.contains('active')) {
      loadDashboard();
    }
  } catch (error) {
    showToast('Error saving contact', 'error', 'Error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
};

window.editContact = function(id) {
  openContactModal(id);
};

window.deleteContact = async function(id) {
  if (confirm('Are you sure you want to delete this contact?')) {
    try {
      await apiCall(`/contacts/${id}`, { method: 'DELETE' });
      showToast('Contact deleted successfully', 'success', 'Deleted');
      loadContacts();
      if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
      }
    } catch (error) {
      showToast('Error deleting contact', 'error', 'Error');
    }
  }
};

// Moved to debounced version below

// ========== COMPANIES ==========
async function loadCompanies() {
  const companies = await apiCall('/companies');
  if (!companies) return;

  const tbody = document.getElementById('companiesTableBody');
  tbody.innerHTML = companies.map(company => `
    <tr>
      <td>${company.name || ''}</td>
      <td>${company.industry || '-'}</td>
      <td>${company.website ? `<a href="${company.website}" target="_blank">${company.website}</a>` : '-'}</td>
      <td>${company.employees || '-'}</td>
      <td>${company.revenue ? `$${formatNumber(company.revenue)}` : '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon btn-edit" onclick="editCompany('${company.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-delete" onclick="deleteCompany('${company.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.openCompanyModal = function(companyId = null) {
  const modal = document.getElementById('companyModal');
  const form = document.getElementById('companyForm');
  const title = document.getElementById('companyModalTitle');

  if (companyId) {
    title.textContent = 'Edit Company';
    apiCall(`/companies`).then(companies => {
      const company = companies.find(c => c.id === companyId);
      if (company) {
        document.getElementById('companyName').value = company.name || '';
        document.getElementById('companyIndustry').value = company.industry || '';
        document.getElementById('companyWebsite').value = company.website || '';
        document.getElementById('companyPhone').value = company.phone || '';
        document.getElementById('companyAddress').value = company.address || '';
        document.getElementById('companyEmployees').value = company.employees || '';
        document.getElementById('companyRevenue').value = company.revenue || '';
        form.dataset.companyId = companyId;
      }
    });
  } else {
    title.textContent = 'Add Company';
    form.reset();
    delete form.dataset.companyId;
  }

  modal.classList.add('active');
};

window.saveCompany = async function(e) {
  e.preventDefault();
  const form = document.getElementById('companyForm');
  const companyId = form.dataset.companyId;
  const submitBtn = form.querySelector('button[type="submit"]');

  const data = {
    name: document.getElementById('companyName').value,
    industry: document.getElementById('companyIndustry').value,
    website: document.getElementById('companyWebsite').value,
    phone: document.getElementById('companyPhone').value,
    address: document.getElementById('companyAddress').value,
    employees: document.getElementById('companyEmployees').value,
    revenue: document.getElementById('companyRevenue').value
  };

  if (!data.name) {
    showToast('Company name is required', 'error', 'Validation Error');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    if (companyId) {
      await apiCall(`/companies/${companyId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      showToast('Company updated successfully', 'success', 'Success');
    } else {
      await apiCall('/companies', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      showToast('Company created successfully', 'success', 'Success');
    }
    closeModal('companyModal');
    loadCompanies();
    if (document.getElementById('dashboard').classList.contains('active')) {
      loadDashboard();
    }
  } catch (error) {
    showToast('Error saving company', 'error', 'Error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
};

window.editCompany = function(id) {
  openCompanyModal(id);
};

window.deleteCompany = async function(id) {
  if (confirm('Are you sure you want to delete this company?')) {
    try {
      await apiCall(`/companies/${id}`, { method: 'DELETE' });
      showToast('Company deleted successfully', 'success', 'Deleted');
      loadCompanies();
      if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
      }
    } catch (error) {
      showToast('Error deleting company', 'error', 'Error');
    }
  }
};

// Moved to debounced version below

// ========== DEALS ==========
async function loadDeals() {
  try {
    const deals = await apiCall('/deals');
    if (!deals) return;

    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    stages.forEach(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      document.getElementById(`count-${stage.toLowerCase()}`).textContent = stageDeals.length;
      const dealsContainer = document.getElementById(`deals-${stage.toLowerCase()}`);
      dealsContainer.innerHTML = stageDeals.map(deal => `
        <div class="deal-card" draggable="true" data-deal-id="${deal.id}" data-stage="${stage}" 
             ondragstart="dragDeal(event, '${deal.id}')" 
             ondragend="dragDealEnd(event)"
             onclick="editDeal('${deal.id}')">
          <div class="deal-card-title">${deal.name || 'Untitled Deal'}</div>
          <div class="deal-card-company">${deal.company || 'No Company'}</div>
          <div class="deal-card-value">$${formatNumber(deal.value || 0)}</div>
        </div>
      `).join('');
      
      // Add drag and drop listeners
      dealsContainer.addEventListener('dragover', handleDragOver);
      dealsContainer.addEventListener('drop', handleDrop);
      dealsContainer.addEventListener('dragenter', handleDragEnter);
      dealsContainer.addEventListener('dragleave', handleDragLeave);
    });
  } catch (error) {
    showToast('Error loading deals', 'error', 'Error');
  }
}

// Drag and Drop handlers
let draggedDealId = null;

window.dragDeal = function(e, dealId) {
  draggedDealId = dealId;
  e.dataTransfer.setData('dealId', dealId);
  e.currentTarget.classList.add('dragging');
};

window.dragDealEnd = function(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.pipeline-column').forEach(col => {
    col.classList.remove('drag-over');
  });
};

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  const column = e.currentTarget.closest('.pipeline-column');
  if (column) {
    column.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const column = e.currentTarget.closest('.pipeline-column');
  if (column && !column.contains(e.relatedTarget)) {
    column.classList.remove('drag-over');
  }
}

async function handleDrop(e) {
  e.preventDefault();
  const column = e.currentTarget.closest('.pipeline-column');
  if (!column || !draggedDealId) return;
  
  const newStage = column.dataset.stage;
  
  try {
    await apiCall(`/deals/${draggedDealId}`, {
      method: 'PUT',
      body: JSON.stringify({ stage: newStage })
    });
    
    showToast('Deal moved successfully', 'success', 'Updated');
    loadDeals();
    if (document.getElementById('dashboard').classList.contains('active')) {
      loadDashboard();
    }
  } catch (error) {
    showToast('Error moving deal', 'error', 'Error');
  }
  
  column.classList.remove('drag-over');
  draggedDealId = null;
}

window.openDealModal = function(dealId = null) {
  const modal = document.getElementById('dealModal');
  const form = document.getElementById('dealForm');
  const title = document.getElementById('dealModalTitle');

  // Load companies and contacts for dropdowns
  Promise.all([
    apiCall('/companies'),
    apiCall('/contacts')
  ]).then(([companies, contacts]) => {
    const companySelect = document.getElementById('dealCompany');
    const contactSelect = document.getElementById('dealContact');
    
    companySelect.innerHTML = '<option value="">Select Company</option>' + 
      companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    contactSelect.innerHTML = '<option value="">Select Contact</option>' + 
      contacts.map(c => `<option value="${c.id}">${c.firstName} ${c.lastName}</option>`).join('');

    if (dealId) {
      title.textContent = 'Edit Deal';
      apiCall(`/deals`).then(deals => {
        const deal = deals.find(d => d.id === dealId);
        if (deal) {
          document.getElementById('dealName').value = deal.name || '';
          document.getElementById('dealCompany').value = deal.companyId || '';
          document.getElementById('dealContact').value = deal.contactId || '';
          document.getElementById('dealValue').value = deal.value || '';
          document.getElementById('dealStage').value = deal.stage || 'Prospecting';
          document.getElementById('dealCloseDate').value = deal.closeDate ? deal.closeDate.split('T')[0] : '';
          form.dataset.dealId = dealId;
        }
      });
    } else {
      title.textContent = 'Add Deal';
      form.reset();
      delete form.dataset.dealId;
    }
  });

  modal.classList.add('active');
};

window.saveDeal = async function(e) {
  e.preventDefault();
  const form = document.getElementById('dealForm');
  const dealId = form.dataset.dealId;
  const submitBtn = form.querySelector('button[type="submit"]');

  const data = {
    name: document.getElementById('dealName').value,
    companyId: document.getElementById('dealCompany').value,
    contactId: document.getElementById('dealContact').value,
    value: document.getElementById('dealValue').value,
    stage: document.getElementById('dealStage').value,
    closeDate: document.getElementById('dealCloseDate').value
  };

  if (!data.name || !data.value) {
    showToast('Deal name and value are required', 'error', 'Validation Error');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    if (dealId) {
      await apiCall(`/deals/${dealId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      showToast('Deal updated successfully', 'success', 'Success');
    } else {
      await apiCall('/deals', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      showToast('Deal created successfully', 'success', 'Success');
    }
    closeModal('dealModal');
    loadDeals();
    if (document.getElementById('dashboard').classList.contains('active')) {
      loadDashboard();
    }
  } catch (error) {
    showToast('Error saving deal', 'error', 'Error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
};

window.editDeal = function(id) {
  openDealModal(id);
};

window.deleteDeal = async function(id) {
  if (confirm('Are you sure you want to delete this deal?')) {
    try {
      await apiCall(`/deals/${id}`, { method: 'DELETE' });
      showToast('Deal deleted successfully', 'success', 'Deleted');
      loadDeals();
      if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
      }
    } catch (error) {
      showToast('Error deleting deal', 'error', 'Error');
    }
  }
};

// ========== TASKS ==========
async function loadTasks() {
  const tasks = await apiCall('/tasks');
  if (!tasks) return;

  renderTasks(tasks);
}

function renderTasks(tasks) {
  const list = document.getElementById('tasksList');
  list.innerHTML = tasks.map(task => `
    <div class="task-item">
      <input type="checkbox" class="task-checkbox" ${task.status === 'Completed' ? 'checked' : ''} 
             onchange="toggleTaskStatus('${task.id}')">
      <div class="task-content">
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description || ''}</div>
        <div class="task-meta">
          <span class="priority-badge priority-${(task.priority || 'medium').toLowerCase()}">${task.priority || 'Medium'}</span>
          <span>Status: ${task.status || 'Pending'}</span>
          ${task.dueDate ? `<span>Due: ${formatDate(task.dueDate)}</span>` : ''}
        </div>
      </div>
      <div class="action-buttons">
        <button class="btn-icon btn-edit" onclick="editTask('${task.id}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon btn-delete" onclick="deleteTask('${task.id}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.filterTasks = function(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  apiCall('/tasks').then(tasks => {
    let filtered = tasks;
    if (filter !== 'all') {
      filtered = tasks.filter(t => {
        if (filter === 'completed') return t.status === 'Completed';
        if (filter === 'pending') return t.status === 'Pending';
        if (filter === 'in-progress') return t.status === 'In Progress';
        return true;
      });
    }
    renderTasks(filtered);
  });
};

window.openTaskModal = function(taskId = null) {
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  const title = document.getElementById('taskModalTitle');

  if (taskId) {
    title.textContent = 'Edit Task';
    apiCall(`/tasks`).then(tasks => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        document.getElementById('taskTitle').value = task.title || '';
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority || 'Medium';
        document.getElementById('taskStatus').value = task.status || 'Pending';
        document.getElementById('taskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';
        form.dataset.taskId = taskId;
      }
    });
  } else {
    title.textContent = 'Add Task';
    form.reset();
    delete form.dataset.taskId;
  }

  modal.classList.add('active');
};

window.saveTask = async function(e) {
  e.preventDefault();
  const form = document.getElementById('taskForm');
  const taskId = form.dataset.taskId;
  const submitBtn = form.querySelector('button[type="submit"]');

  const data = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    dueDate: document.getElementById('taskDueDate').value
  };

  if (!data.title) {
    showToast('Task title is required', 'error', 'Validation Error');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    if (taskId) {
      await apiCall(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      showToast('Task updated successfully', 'success', 'Success');
    } else {
      await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      showToast('Task created successfully', 'success', 'Success');
    }
    closeModal('taskModal');
    loadTasks();
    if (document.getElementById('dashboard').classList.contains('active')) {
      loadDashboard();
    }
  } catch (error) {
    showToast('Error saving task', 'error', 'Error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
};

window.editTask = function(id) {
  openTaskModal(id);
};

window.toggleTaskStatus = async function(id) {
  try {
    const tasks = await apiCall('/tasks');
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await apiCall(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Task marked as ${newStatus}`, 'success', 'Updated');
      loadTasks();
      if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
      }
    }
  } catch (error) {
    showToast('Error updating task', 'error', 'Error');
  }
};

window.deleteTask = async function(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await apiCall(`/tasks/${id}`, { method: 'DELETE' });
      showToast('Task deleted successfully', 'success', 'Deleted');
      loadTasks();
      if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
      }
    } catch (error) {
      showToast('Error deleting task', 'error', 'Error');
    }
  }
};

// ========== ACTIVITIES ==========
async function loadActivities() {
  const activities = await apiCall('/activities');
  if (!activities) return;

  const list = document.getElementById('activitiesList');
  list.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon" style="background: #dbeafe; color: #2563eb;">
        <i class="fas fa-${getActivityIcon(activity.type)}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-header">
          <span class="activity-subject">${activity.subject}</span>
          <span class="activity-time">${formatTimeAgo(activity.createdAt)}</span>
        </div>
        <div class="activity-description">${activity.description || ''}</div>
      </div>
    </div>
  `).join('');
}

window.openActivityModal = function() {
  document.getElementById('activityModal').classList.add('active');
};

window.saveActivity = async function(e) {
  e.preventDefault();
  const form = document.getElementById('activityForm');
  const submitBtn = form.querySelector('button[type="submit"]');

  const data = {
    type: document.getElementById('activityType').value,
    subject: document.getElementById('activitySubject').value,
    description: document.getElementById('activityDescription').value,
    related: document.getElementById('activityRelated').value
  };

  if (!data.type || !data.subject) {
    showToast('Activity type and subject are required', 'error', 'Validation Error');
    return;
  }

  setButtonLoading(submitBtn, true);

  try {
    await apiCall('/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    showToast('Activity logged successfully', 'success', 'Success');
    closeModal('activityModal');
    form.reset();
    loadActivities();
    if (document.getElementById('dashboard').classList.contains('active')) {
      loadDashboard();
    }
  } catch (error) {
    showToast('Error saving activity', 'error', 'Error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
};

// ========== REPORTS ==========
async function loadReports() {
  try {
    const [stats, deals, companies] = await Promise.all([
      apiCall('/dashboard/stats'),
      apiCall('/deals'),
      apiCall('/companies')
    ]);

    if (!stats) return;

    // Revenue chart with visual bars
    const revenueData = deals ? deals.reduce((acc, deal) => {
      if (deal.stage === 'Won' && deal.value) {
        const month = new Date(deal.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + parseFloat(deal.value);
      }
      return acc;
    }, {}) : {};
    
    const maxRevenue = Math.max(...Object.values(revenueData), 1);
    const revenueBars = Object.entries(revenueData).map(([month, value]) => {
      const height = (value / maxRevenue) * 100;
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 100%; height: 150px; display: flex; align-items: flex-end;">
            <div style="width: 100%; height: ${height}%; background: linear-gradient(180deg, #2563eb, #3b82f6); border-radius: 4px 4px 0 0; transition: all 0.3s;"></div>
          </div>
          <div style="font-size: 11px; color: #64748b; font-weight: 600;">${month}</div>
          <div style="font-size: 10px; color: #94a3b8;">$${formatNumber(value)}</div>
        </div>
      `;
    }).join('') || '<div style="padding: 40px; text-align: center; color: #64748b;">No revenue data available</div>';
    
    document.getElementById('revenueChart').innerHTML = `
      <div style="padding: 20px;">
        <div style="display: flex; gap: 8px; height: 200px; align-items: flex-end;">
          ${revenueBars}
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #2563eb;">$${formatNumber(stats.totalRevenue)}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Total Revenue</div>
        </div>
      </div>
    `;

    // Conversion chart with circular progress
    const conversionRate = stats.conversionRate || 0;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (conversionRate / 100) * circumference;
    
    document.getElementById('conversionChart').innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <div style="position: relative; display: inline-block; margin-bottom: 16px;">
          <svg width="120" height="120" style="transform: rotate(-90deg);">
            <circle cx="60" cy="60" r="45" stroke="#e2e8f0" stroke-width="8" fill="none"></circle>
            <circle cx="60" cy="60" r="45" stroke="#2563eb" stroke-width="8" fill="none" 
                    stroke-dasharray="${circumference}" 
                    stroke-dashoffset="${offset}"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 1s ease;"></circle>
          </svg>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
            <div style="font-size: 24px; font-weight: 700; color: #2563eb;">${conversionRate}%</div>
          </div>
        </div>
        <div style="color: #64748b; font-size: 14px;">
          ${stats.wonDeals || 0} of ${stats.totalDeals || 0} deals won
        </div>
      </div>
    `;

    // Top companies
    if (companies && companies.length > 0) {
      const topCompanies = companies
        .filter(c => c.revenue)
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 5);
      
      const maxRevenue = Math.max(...topCompanies.map(c => c.revenue || 0), 1);
      
      document.getElementById('topCompanies').innerHTML = topCompanies.map(c => {
        const width = ((c.revenue || 0) / maxRevenue) * 100;
        return `
          <div style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-weight: 600;">${c.name}</span>
              <span style="font-weight: 600; color: #2563eb;">$${formatNumber(c.revenue)}</span>
            </div>
            <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${width}%; background: linear-gradient(90deg, #2563eb, #3b82f6); border-radius: 3px; transition: width 0.5s ease;"></div>
            </div>
          </div>
        `;
      }).join('') || '<p style="padding: 20px; text-align: center; color: #64748b;">No companies with revenue data</p>';
    }

    // Activity summary with visual bars
    const activities = await apiCall('/activities');
    if (activities && activities.length > 0) {
      const summary = activities.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {});

      const maxCount = Math.max(...Object.values(summary), 1);
      
      document.getElementById('activitySummary').innerHTML = Object.entries(summary)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => {
          const width = (count / maxCount) * 100;
          return `
            <div style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 600;">${type}</span>
                <span style="font-weight: 600; color: #2563eb;">${count}</span>
              </div>
              <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${width}%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 3px; transition: width 0.5s ease;"></div>
              </div>
            </div>
          `;
        }).join('');
    } else {
      document.getElementById('activitySummary').innerHTML = '<p style="padding: 20px; text-align: center; color: #64748b;">No activities</p>';
    }
  } catch (error) {
    showToast('Error loading reports', 'error', 'Error');
  }
}

// ========== CALENDAR ==========
async function loadCalendar() {
  try {
    const [tasks, activities] = await Promise.all([
      apiCall('/tasks'),
      apiCall('/activities')
    ]);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Group tasks and activities by date
    const eventsByDate = {};
    
    if (tasks) {
      tasks.forEach(task => {
        if (task.dueDate) {
          const date = new Date(task.dueDate).toDateString();
          if (!eventsByDate[date]) eventsByDate[date] = [];
          eventsByDate[date].push({
            type: 'task',
            title: task.title,
            priority: task.priority,
            status: task.status
          });
        }
      });
    }
    
    if (activities) {
      activities.forEach(activity => {
        const date = new Date(activity.createdAt).toDateString();
        if (!eventsByDate[date]) eventsByDate[date] = [];
        eventsByDate[date].push({
          type: 'activity',
          title: activity.subject,
          activityType: activity.type
        });
      });
    }
    
    // Generate calendar grid
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let calendarHTML = `
      <div style="padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">
            ${monthNames[currentMonth]} ${currentYear}
          </h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 8px;">
    `;
    
    // Day headers
    dayNames.forEach(day => {
      calendarHTML += `
        <div style="padding: 12px; text-align: center; font-weight: 600; font-size: 12px; color: var(--text-secondary); text-transform: uppercase;">
          ${day}
        </div>
      `;
    });
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarHTML += `<div style="padding: 8px; min-height: 100px; border: 1px solid var(--border-color); border-radius: 8px; background: #f8fafc;"></div>`;
    }
    
    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const events = eventsByDate[dateString] || [];
      
      calendarHTML += `
        <div style="padding: 8px; min-height: 100px; border: 1px solid var(--border-color); border-radius: 8px; 
                    background: ${isToday ? 'rgba(37, 99, 235, 0.05)' : 'white'}; 
                    ${isToday ? 'border: 2px solid var(--primary-color);' : ''}
                    transition: all var(--transition-fast);">
          <div style="font-weight: 600; margin-bottom: 8px; color: ${isToday ? 'var(--primary-color)' : 'var(--text-primary)'};">
            ${day}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${events.slice(0, 3).map(event => `
              <div style="font-size: 10px; padding: 4px 6px; background: ${event.type === 'task' ? '#dbeafe' : '#d1fae5'}; 
                         border-radius: 4px; color: ${event.type === 'task' ? '#1e40af' : '#065f46'}; 
                         overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                   title="${event.title}">
                ${event.type === 'task' ? '📋' : '📞'} ${event.title}
              </div>
            `).join('')}
            ${events.length > 3 ? `<div style="font-size: 10px; color: var(--text-secondary);">+${events.length - 3} more</div>` : ''}
          </div>
        </div>
      `;
    }
    
    calendarHTML += `
        </div>
        <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px;">
          <div style="display: flex; gap: 16px; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #dbeafe; border-radius: 3px;"></div>
              <span style="font-size: 12px; color: var(--text-secondary);">Tasks</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; background: #d1fae5; border-radius: 3px;"></div>
              <span style="font-size: 12px; color: var(--text-secondary);">Activities</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('calendarView').innerHTML = calendarHTML;
  } catch (error) {
    showToast('Error loading calendar', 'error', 'Error');
    document.getElementById('calendarView').innerHTML = `
      <div style="padding: 40px; text-align: center; color: #64748b;">
        <i class="fas fa-calendar" style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>Error loading calendar</p>
      </div>
    `;
  }
}

// ========== MODAL HELPERS ==========
window.closeModal = function(modalId) {
  document.getElementById(modalId).classList.remove('active');
};

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  // Close modal on Escape key
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }
  
  // Keyboard shortcuts (Ctrl/Cmd + Key)
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
    switch(e.key) {
      case 'k':
        e.preventDefault();
        // Focus search if available
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
        break;
      case 'n':
        e.preventDefault();
        // Quick add based on current section
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
          const sectionId = activeSection.id;
          if (sectionId === 'contacts') openContactModal();
          else if (sectionId === 'companies') openCompanyModal();
          else if (sectionId === 'deals') openDealModal();
          else if (sectionId === 'tasks') openTaskModal();
          else if (sectionId === 'activities') openActivityModal();
        }
        break;
      case '1':
        e.preventDefault();
        showSection('dashboard');
        break;
      case '2':
        e.preventDefault();
        showSection('contacts');
        break;
      case '3':
        e.preventDefault();
        showSection('companies');
        break;
      case '4':
        e.preventDefault();
        showSection('deals');
        break;
      case '5':
        e.preventDefault();
        showSection('tasks');
        break;
    }
  }
});

// ========== UTILITY FUNCTIONS ==========
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

function getActivityIcon(type) {
  const icons = {
    'Call': 'phone',
    'Email': 'envelope',
    'Meeting': 'users',
    'Note': 'sticky-note',
    'Other': 'circle'
  };
  return icons[type] || 'circle';
}

// ========== UTILITY: DEBOUNCE FUNCTION ==========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========== ENHANCED SEARCH WITH DEBOUNCE ==========
window.filterContacts = debounce(function() {
  const search = document.getElementById('contactSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#contactsTableBody tr');
  let visibleCount = 0;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const isVisible = text.includes(search);
    row.style.display = isVisible ? '' : 'none';
    if (isVisible) visibleCount++;
  });
  
  // Show message if no results
  const tbody = document.getElementById('contactsTableBody');
  let noResults = tbody.querySelector('.no-results');
  if (visibleCount === 0 && search && !noResults) {
    noResults = document.createElement('tr');
    noResults.className = 'no-results';
    noResults.innerHTML = `<td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">No contacts found matching "${search}"</td>`;
    tbody.appendChild(noResults);
  } else if (noResults && (visibleCount > 0 || !search)) {
    noResults.remove();
  }
}, 300);

window.filterCompanies = debounce(function() {
  const search = document.getElementById('companySearch').value.toLowerCase();
  const rows = document.querySelectorAll('#companiesTableBody tr');
  let visibleCount = 0;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const isVisible = text.includes(search);
    row.style.display = isVisible ? '' : 'none';
    if (isVisible) visibleCount++;
  });
  
  // Show message if no results
  const tbody = document.getElementById('companiesTableBody');
  let noResults = tbody.querySelector('.no-results');
  if (visibleCount === 0 && search && !noResults) {
    noResults = document.createElement('tr');
    noResults.className = 'no-results';
    noResults.innerHTML = `<td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">No companies found matching "${search}"</td>`;
    tbody.appendChild(noResults);
  } else if (noResults && (visibleCount > 0 || !search)) {
    noResults.remove();
  }
}, 300);

