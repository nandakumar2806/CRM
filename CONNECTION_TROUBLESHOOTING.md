# Connection Error Troubleshooting Guide

If you're experiencing connection errors with your CRM system, follow these steps:

## 🔍 Quick Diagnosis

### 1. Check if Server is Running Locally

**Windows:**
```bash
# Check if server is running on port 3000
netstat -ano | findstr :3000

# Or start the server
npm start
# or
node server.js
```

**Expected Output:**
```
✅ CRM Server is RUNNING!
📍 URL: http://localhost:3000
📍 Health Check: http://localhost:3000/health
```

### 2. Test Server Connection

Open your browser and visit:
- **Health Check:** http://localhost:3000/health
- **Main App:** http://localhost:3000

You should see:
```json
{
  "status": "ok",
  "message": "CRM Server is running",
  "timestamp": "..."
}
```

### 3. Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for error messages like:
   - `Failed to fetch`
   - `NetworkError`
   - `CORS error`

### 4. Common Issues and Solutions

#### Issue: "Cannot connect to server"

**Causes:**
- Server is not running
- Wrong port number
- Firewall blocking connection
- Server crashed

**Solutions:**
1. Start the server: `npm start` or `node server.js`
2. Check if port 3000 is available
3. Try a different port: Set `PORT=3001` in environment variables
4. Check server logs for errors

#### Issue: CORS Error

**Symptoms:**
- Browser console shows: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
- The server already has CORS enabled, but if you're accessing from a different origin:
  - Make sure you're accessing the app from the same origin as the server
  - Or update CORS settings in `server.js`

#### Issue: 404 Not Found

**Symptoms:**
- API calls return 404 errors

**Solutions:**
1. Check API endpoint URLs in `script.js`
2. Ensure routes are defined in `server.js`
3. Verify the API base URL is correct

#### Issue: 401 Unauthorized

**Symptoms:**
- "Access token required" error
- "Invalid or expired token" error

**Solutions:**
1. Make sure you're logged in
2. Check if token is stored in localStorage
3. Try logging in again

### 5. For GitHub/Deployed Versions

If you're trying to access the app on GitHub Pages or a deployed version:

**Important:** GitHub Pages only hosts static files. You **cannot** run a Node.js server on GitHub Pages.

**Solutions:**

1. **Deploy to Vercel (Recommended):**
   - Push code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically

2. **Deploy to Render:**
   - Push code to GitHub
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository
   - Deploy

3. **Use Separate Backend:**
   - Deploy frontend to GitHub Pages
   - Deploy backend to a Node.js hosting service
   - Update `API_BASE_URL` in frontend to point to backend URL

### 6. Environment Variables

Make sure these are set (if needed):

```bash
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key-here
```

### 7. Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try to login or make an API call
4. Check the request:
   - **Status:** Should be 200 (OK) or 201 (Created)
   - **URL:** Should match your API endpoint
   - **Headers:** Check if Authorization header is present

### 8. Test API Directly

Use curl or Postman to test API:

```bash
# Health check
curl http://localhost:3000/health

# Login (replace with your credentials)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 9. Reset Everything

If nothing works:

1. **Stop the server** (Ctrl+C)
2. **Clear browser cache and localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   ```
3. **Restart server:**
   ```bash
   npm start
   ```
4. **Refresh browser** (Ctrl+F5)

### 10. Check Server Logs

Look at the terminal where the server is running for:
- Error messages
- Stack traces
- Connection attempts

## 📞 Still Having Issues?

1. Check the server terminal for error messages
2. Check browser console for JavaScript errors
3. Check Network tab for failed requests
4. Verify all dependencies are installed: `npm install`
5. Make sure Node.js version is compatible (v14+)

## ✅ Quick Test Checklist

- [ ] Server is running (`npm start`)
- [ ] Can access http://localhost:3000/health
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Dependencies are installed (`npm install`)
- [ ] Port 3000 is not blocked by firewall

---

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

