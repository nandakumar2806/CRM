const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve static files from `public` if exists; otherwise serve from project root.
const PUBLIC_DIR = fsSync.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;

app.use(express.static(PUBLIC_DIR));

// Data storage files
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');
const DEALS_FILE = path.join(DATA_DIR, 'deals.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

// Initialize data directory
async function initDataDir() {
  try {
    console.log('📁 Initializing data directory...');
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('✅ Data directory ready');
    await initializeFiles();
    console.log('✅ Data files initialized');
  } catch (error) {
    console.error('❌ Error initializing data directory:', error.message);
    throw error;
  }
}

// Initialize JSON files with default data
async function initializeFiles() {
  const files = [
    { path: USERS_FILE, default: [{ id: '1', username: 'admin', password: await bcrypt.hash('admin123', 10), name: 'Admin User', email: 'admin@crm.com', role: 'admin', createdAt: new Date().toISOString() }] },
    { path: CONTACTS_FILE, default: [] },
    { path: COMPANIES_FILE, default: [] },
    { path: DEALS_FILE, default: [] },
    { path: TASKS_FILE, default: [] },
    { path: ACTIVITIES_FILE, default: [] },
    { path: NOTES_FILE, default: [] }
  ];

  for (const file of files) {
    try {
      await fs.access(file.path);
    } catch {
      await fs.writeFile(file.path, JSON.stringify(file.default, null, 2));
    }
  }
  console.log(`✅ Initialized ${files.length} data files`);
}

// Helper functions to read/write JSON files
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ========== AUTHENTICATION ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const users = await readJSON(USERS_FILE);

    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJSON(USERS_FILE, users);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, username: newUser.username, name: newUser.name, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.username === username || u.email === username);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONTACTS ROUTES ==========
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await readJSON(CONTACTS_FILE);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await readJSON(CONTACTS_FILE);
    const newContact = {
      id: uuidv4(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    contacts.push(newContact);
    await writeJSON(CONTACTS_FILE, contacts);
    res.json(newContact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contacts = await readJSON(CONTACTS_FILE);
    const index = contacts.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Contact not found' });

    contacts[index] = { ...contacts[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJSON(CONTACTS_FILE, contacts);
    res.json(contacts[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const contacts = await readJSON(CONTACTS_FILE);
    const filtered = contacts.filter(c => c.id !== req.params.id);
    await writeJSON(CONTACTS_FILE, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== COMPANIES ROUTES ==========
app.get('/api/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await readJSON(COMPANIES_FILE);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await readJSON(COMPANIES_FILE);
    const newCompany = {
      id: uuidv4(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    companies.push(newCompany);
    await writeJSON(COMPANIES_FILE, companies);
    res.json(newCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const companies = await readJSON(COMPANIES_FILE);
    const index = companies.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Company not found' });

    companies[index] = { ...companies[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJSON(COMPANIES_FILE, companies);
    res.json(companies[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/companies/:id', authenticateToken, async (req, res) => {
  try {
    const companies = await readJSON(COMPANIES_FILE);
    const filtered = companies.filter(c => c.id !== req.params.id);
    await writeJSON(COMPANIES_FILE, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DEALS ROUTES ==========
app.get('/api/deals', authenticateToken, async (req, res) => {
  try {
    const deals = await readJSON(DEALS_FILE);
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deals', authenticateToken, async (req, res) => {
  try {
    const deals = await readJSON(DEALS_FILE);
    const newDeal = {
      id: uuidv4(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    deals.push(newDeal);
    await writeJSON(DEALS_FILE, deals);
    res.json(newDeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const deals = await readJSON(DEALS_FILE);
    const index = deals.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Deal not found' });

    deals[index] = { ...deals[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJSON(DEALS_FILE, deals);
    res.json(deals[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/deals/:id', authenticateToken, async (req, res) => {
  try {
    const deals = await readJSON(DEALS_FILE);
    const filtered = deals.filter(d => d.id !== req.params.id);
    await writeJSON(DEALS_FILE, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== TASKS ROUTES ==========
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await readJSON(TASKS_FILE);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await readJSON(TASKS_FILE);
    const newTask = {
      id: uuidv4(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    await writeJSON(TASKS_FILE, tasks);
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const tasks = await readJSON(TASKS_FILE);
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    tasks[index] = { ...tasks[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJSON(TASKS_FILE, tasks);
    res.json(tasks[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const tasks = await readJSON(TASKS_FILE);
    const filtered = tasks.filter(t => t.id !== req.params.id);
    await writeJSON(TASKS_FILE, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ACTIVITIES ROUTES ==========
app.get('/api/activities', authenticateToken, async (req, res) => {
  try {
    const activities = await readJSON(ACTIVITIES_FILE);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    const activities = await readJSON(ACTIVITIES_FILE);
    const newActivity = {
      id: uuidv4(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    activities.unshift(newActivity);
    await writeJSON(ACTIVITIES_FILE, activities);
    res.json(newActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== NOTES ROUTES ==========
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    const notes = await readJSON(NOTES_FILE);
    let filtered = notes;

    if (entityType && entityId) {
      filtered = notes.filter(n => n.entityType === entityType && n.entityId === entityId);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await readJSON(NOTES_FILE);
    const newNote = {
      id: uuidv4(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.push(newNote);
    await writeJSON(NOTES_FILE, notes);
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const notes = await readJSON(NOTES_FILE);
    const index = notes.findIndex(n => n.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Note not found' });

    notes[index] = { ...notes[index], ...req.body, updatedAt: new Date().toISOString() };
    await writeJSON(NOTES_FILE, notes);
    res.json(notes[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const notes = await readJSON(NOTES_FILE);
    const filtered = notes.filter(n => n.id !== req.params.id);
    await writeJSON(NOTES_FILE, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DASHBOARD STATS ==========
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [contacts, companies, deals, tasks] = await Promise.all([
      readJSON(CONTACTS_FILE),
      readJSON(COMPANIES_FILE),
      readJSON(DEALS_FILE),
      readJSON(TASKS_FILE)
    ]);

    const totalRevenue = deals.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0);
    const wonDeals = deals.filter(d => d.stage === 'Won').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

    res.json({
      totalContacts: contacts.length,
      totalCompanies: companies.length,
      totalDeals: deals.length,
      totalRevenue,
      wonDeals,
      pendingTasks,
      conversionRate: deals.length > 0 ? ((wonDeals / deals.length) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint (no auth required) - must be before catch-all
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CRM Server is running', timestamp: new Date().toISOString() });
});

// Serve frontend (catch-all route - must be last)
app.get('*', (req, res) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Initialize and start server
initDataDir().then(() => {
  app.listen(PORT, () => {
    console.log('========================================');
    console.log('✅ CRM Server is RUNNING!');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
    console.log('========================================');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
  });
}).catch((error) => {
  console.error('❌ Error starting server:', error);
  console.log('Server will still attempt to start...');
  app.listen(PORT, () => {
    console.log('========================================');
    console.log('⚠️  CRM Server started (with warnings)');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('========================================');
  });
});

