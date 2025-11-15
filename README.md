# Full-Stack CRM System

A comprehensive Customer Relationship Management (CRM) system built with Node.js, Express.js, and vanilla JavaScript. This is a complete, production-ready CRM solution with all essential features for managing contacts, companies, deals, tasks, and activities.

## Features

### 🎯 Core Features

- **Dashboard**: Real-time analytics and overview of your business metrics
- **Contacts Management**: Complete contact database with search and filtering
- **Companies Management**: Track companies, industries, and revenue
- **Deals Pipeline**: Visual kanban board for managing sales deals through stages
- **Tasks Management**: Create, assign, and track tasks with priorities
- **Activities Log**: Track all interactions (calls, emails, meetings, notes)
- **Reports & Analytics**: Comprehensive reporting and data visualization
- **Calendar View**: Schedule and view upcoming events
- **User Authentication**: Secure login and registration system

### 📊 Dashboard Metrics

- Total Contacts
- Total Companies
- Total Deals
- Total Revenue
- Won Deals Count
- Conversion Rate
- Recent Activities Feed
- Upcoming Tasks
- Deal Pipeline Visualization

### 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Secure API endpoints
- Token-based session management

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **uuid**: Unique ID generation
- **CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Structure
- **CSS3**: Modern styling with CSS variables
- **Vanilla JavaScript**: No framework dependencies
- **Font Awesome**: Icons
- **Google Fonts**: Typography

### Data Storage
- JSON file-based storage (easily upgradeable to database)
- Persistent data across sessions
- Automatic data initialization

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Instructions

1. **Clone or download the project**
   ```bash
   cd litnetX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser and navigate to: `http://localhost:3000`
   - Default login credentials:
     - Username: `admin`
     - Password: `admin123`

## 🚀 Deployment

This application is ready to deploy to various platforms. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:

- **Vercel** (Recommended): One-click deploy with automatic GitHub integration
- **Render**: Free tier with persistent storage
- **GitHub Pages**: Frontend-only deployment

The repository includes GitHub Actions workflows for automated CI/CD. See `.github/workflows/` for available deployment options.

## Project Structure

```
litnetX/
├── server.js              # Express server and API routes
├── package.json           # Dependencies and scripts
├── data/                  # JSON data storage (auto-created)
│   ├── users.json
│   ├── contacts.json
│   ├── companies.json
│   ├── deals.json
│   ├── tasks.json
│   ├── activities.json
│   └── notes.json
├── public/                # Frontend files
│   ├── index.html         # Main HTML file
│   ├── style.css          # Stylesheet
│   └── script.js          # Frontend JavaScript
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Deals
- `GET /api/deals` - Get all deals
- `POST /api/deals` - Create new deal
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create new activity

### Notes
- `GET /api/notes` - Get all notes (with optional filters)
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Usage Guide

### Creating a Contact
1. Navigate to "Contacts" in the sidebar
2. Click "Add Contact" button
3. Fill in the contact information
4. Click "Save"

### Managing Deals
1. Go to "Deals" section
2. View deals organized by stage (Prospecting, Qualification, Proposal, Negotiation, Won, Lost)
3. Click "Add Deal" to create a new deal
4. Click on any deal card to edit it
5. Drag deals between stages (coming soon)

### Creating Tasks
1. Navigate to "Tasks"
2. Click "Add Task"
3. Set priority, status, and due date
4. Use filters to view tasks by status
5. Check off tasks to mark as completed

### Logging Activities
1. Go to "Activities" section
2. Click "Log Activity"
3. Select activity type (Call, Email, Meeting, Note, Other)
4. Add description and save

### Viewing Reports
1. Navigate to "Reports & Analytics"
2. View revenue charts, conversion rates, top companies, and activity summaries

## Features in Detail

### Contacts Management
- Full CRUD operations
- Search and filter functionality
- Status tracking (Active, Inactive, Lead)
- Company association
- Job title and contact information

### Companies Management
- Company profiles with industry classification
- Revenue tracking
- Employee count
- Website and contact information
- Address management

### Deal Pipeline
- Visual kanban board
- Six-stage pipeline: Prospecting → Qualification → Proposal → Negotiation → Won/Lost
- Deal value tracking
- Company and contact association
- Expected close date

### Task Management
- Priority levels (Low, Medium, High)
- Status tracking (Pending, In Progress, Completed)
- Due date management
- Task filtering
- Quick completion toggle

### Activity Logging
- Multiple activity types
- Subject and description
- Related entity tracking
- Timestamp tracking
- Activity feed on dashboard

## Customization

### Changing Port
Edit `server.js` and change the PORT variable:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your desired port
```

### Changing JWT Secret
For production, change the JWT_SECRET in `server.js`:
```javascript
const JWT_SECRET = 'your-secret-key-change-in-production';
```

### Styling
All styles are in `public/style.css` using CSS variables for easy theming:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  /* ... more variables */
}
```

## Database Migration

Currently using JSON file storage. To migrate to a database:

1. Install your preferred database driver (MongoDB, PostgreSQL, MySQL)
2. Replace file read/write operations in `server.js` with database queries
3. Update data models as needed

## Security Considerations

- Change JWT_SECRET in production
- Implement rate limiting
- Add input validation and sanitization
- Use HTTPS in production
- Implement proper error handling
- Add CSRF protection
- Consider adding role-based access control (RBAC)

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify Node.js is installed: `node --version`
- Check if dependencies are installed: `npm install`

### Login not working
- Verify server is running
- Check browser console for errors
- Ensure API_BASE URL in script.js matches your server

### Data not persisting
- Check if `data/` directory exists
- Verify file permissions
- Check server logs for errors

## Future Enhancements

- [ ] Email integration
- [ ] Calendar synchronization
- [ ] Document management
- [ ] Advanced reporting with charts
- [ ] Export functionality (CSV, PDF)
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Team collaboration features
- [ ] Custom fields
- [ ] Workflow automation
- [ ] Integration with third-party services

## Contributing

This is a complete CRM system ready for use. Feel free to:
- Add new features
- Improve existing functionality
- Fix bugs
- Enhance UI/UX
- Add tests

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Check browser console for errors
4. Verify all dependencies are installed

## Credits

Built with modern web technologies and best practices for a complete, professional CRM solution.

---

**Note**: This is a full-stack application. Make sure both the server and client are properly configured. The server must be running for the application to work.

