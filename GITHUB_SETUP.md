# GitHub Setup Guide for litnetX

This guide will help you set up your litnetX project on GitHub and enable automated deployments.

## 📋 Initial Setup

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it `litnetX` (or your preferred name)
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Initialize Git and Push to GitHub

If you haven't initialized git yet:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: litnetX CRM system"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/litnetX.git

# Push to GitHub
git branch -M main
git push -u origin main
```

If you already have git initialized:

```bash
# Add GitHub repository as remote (if not already added)
git remote add origin https://github.com/YOUR_USERNAME/litnetX.git

# Push to GitHub
git push -u origin main
```

### 3. Verify Files Are Pushed

Check your GitHub repository to ensure:
- ✅ `package.json` is present
- ✅ `server.js` is present
- ✅ `.github/workflows/` directory exists
- ✅ `vercel.json` or `render.yaml` exists
- ✅ `README.md` and `DEPLOYMENT.md` are present

## 🚀 Enable GitHub Actions

GitHub Actions are already configured! They will automatically run when you push code.

### View Workflows

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. You should see workflows like:
   - CI/CD Pipeline
   - Deploy to Production
   - Test Application

### Enable Workflows

If workflows are disabled:
1. Go to repository Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Save changes

## 🔐 Set Up Secrets (For Automated Deployment)

### For Vercel Deployment

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

   **VERCEL_TOKEN**
   - Get from: Vercel Dashboard → Settings → Tokens
   - Create a new token if needed

   **VERCEL_ORG_ID**
   - Get from: Vercel project settings → General
   - Or from `.vercel/project.json` after first deployment

   **VERCEL_PROJECT_ID**
   - Get from: Vercel project settings → General
   - Or from `.vercel/project.json` after first deployment

### For Render Deployment

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add these secrets:

   **RENDER_API_KEY**
   - Get from: Render Dashboard → Account Settings → API Keys
   - Create a new API key

   **RENDER_SERVICE_ID**
   - Get from: Your Render service settings → Info tab

## 📝 Next Steps

1. **Choose a deployment platform** (see [DEPLOYMENT.md](./DEPLOYMENT.md))
2. **Set up environment variables** on your hosting platform
3. **Test the deployment** by pushing a commit
4. **Monitor GitHub Actions** to see automated builds

## 🔄 Continuous Deployment

Once set up:
- Every push to `main` branch triggers automatic deployment
- Pull requests trigger tests (but not deployment)
- You can manually trigger workflows from the Actions tab

## ✅ Verification Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] GitHub Actions enabled
- [ ] Secrets configured (if using automated deployment)
- [ ] First deployment successful
- [ ] Application accessible via deployed URL

## 🐛 Troubleshooting

### Workflows Not Running
- Check if Actions are enabled in repository settings
- Verify workflow files are in `.github/workflows/`
- Check branch name matches workflow triggers (`main` or `master`)

### Deployment Fails
- Check workflow logs in Actions tab
- Verify secrets are set correctly
- Ensure hosting platform account is connected
- Check environment variables are configured

### Build Errors
- Verify Node.js version compatibility
- Check `package.json` has all dependencies
- Review build logs for specific errors

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific guides

---

**Ready to deploy?** Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for your chosen platform!

