# Deployment Guide for litnetX CRM

This guide will help you deploy your litnetX CRM application to various platforms using GitHub.

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel provides free hosting for Node.js applications with automatic deployments from GitHub.

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the settings from `vercel.json`
   - Click "Deploy"

3. **Set up GitHub Secrets (for automated deployments)**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Get from Vercel Dashboard → Settings → Tokens
     - `VERCEL_ORG_ID`: Found in Vercel project settings
     - `VERCEL_PROJECT_ID`: Found in Vercel project settings

4. **Your app will be live!**
   - Vercel will provide a URL like: `https://your-app.vercel.app`
   - Every push to `main` branch will automatically deploy

### Option 2: Deploy to Render

Render provides free tier hosting with persistent storage.

#### Steps:

1. **Push your code to GitHub**

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect settings from `render.yaml`
   - Or manually configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node
     - **Health Check Path**: `/health`

4. **Set Environment Variables**
   - Add `JWT_SECRET` (generate a secure random string)
   - Add `NODE_ENV=production`
   - Add `PORT=10000` (or let Render assign)

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

6. **Set up GitHub Actions (Optional)**
   - Go to GitHub repository → Settings → Secrets
   - Add:
     - `RENDER_API_KEY`: From Render Dashboard → Account Settings → API Keys
     - `RENDER_SERVICE_ID`: From your service settings

### Option 3: GitHub Pages (Frontend Only)

If you want to deploy just the frontend to GitHub Pages:

1. **Update API URL**
   - The frontend will automatically use the current origin for API calls
   - Or set `window.API_BASE_URL` in your HTML

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select source branch (e.g., `main`)
   - Select folder: `/public`
   - Save

3. **Note**: This only works if you have a separate backend API deployed elsewhere

## 📋 Pre-Deployment Checklist

- [ ] Update `JWT_SECRET` in `server.js` or use environment variable
- [ ] Ensure `package-lock.json` is committed
- [ ] Test the application locally
- [ ] Verify all environment variables are set
- [ ] Check that data directory will be created automatically

## 🔧 Environment Variables

Set these in your hosting platform:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Server port (usually auto-assigned) | No |
| `JWT_SECRET` | Secret key for JWT tokens | Yes (change from default) |

## 🔐 Security Notes

1. **Change JWT_SECRET**: The default secret in `server.js` should be changed in production
2. **Use HTTPS**: All production deployments should use HTTPS
3. **Environment Variables**: Never commit secrets to GitHub

## 📝 GitHub Actions

The repository includes CI/CD workflows:

- **`.github/workflows/ci.yml`**: Runs tests on every push/PR
- **`.github/workflows/deploy.yml`**: Deploys to Vercel on main branch
- **`.github/workflows/render-deploy.yml`**: Deploys to Render on main branch

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check build logs in your hosting platform

### API Not Working
- Verify API_BASE_URL is set correctly
- Check CORS settings in `server.js`
- Ensure backend is deployed and accessible

### Data Not Persisting
- On Vercel: Use a database (Vercel has ephemeral file system)
- On Render: File system persists, but consider using a database for production
- Consider migrating to MongoDB, PostgreSQL, or similar

## 🔄 Continuous Deployment

Once set up, every push to the `main` branch will automatically:
1. Run tests (if configured)
2. Build the application
3. Deploy to production

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 💡 Next Steps

1. Set up a database (MongoDB, PostgreSQL, etc.) for production
2. Add monitoring and logging
3. Set up custom domain
4. Configure backup strategies
5. Add rate limiting and security headers

---

**Need Help?** Check the main README.md or open an issue on GitHub.

