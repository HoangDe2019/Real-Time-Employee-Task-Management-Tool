# Deployment Guide

This guide provides step-by-step instructions for deploying the Real-Time Employee Task Management Tool.

## Quick Start

### 1. Client Deployment (GitHub Pages)

The client is automatically deployed to GitHub Pages using GitHub Actions.

**Prerequisites:**
- GitHub repository with Actions enabled
- Push access to main/develop branches

**Steps:**
1. Push your code to the `main` or `develop` branch
2. GitHub Actions will automatically build and deploy
3. Your app will be available at: `https://yourusername.github.io/Real-Time-Employee-Task-Management-Tool/`

**Manual Setup:**
1. Go to Repository Settings → Pages
2. Source: GitHub Actions
3. The workflow will handle the rest

### 2. Server Deployment Options

Choose one of the following platforms:

## Railway Deployment (Recommended)

### Prerequisites
- Railway account
- GitHub repository

### Steps

1. **Connect Repository**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**
   - Select the `server` folder as root directory
   - Railway will auto-detect Node.js

3. **Set Environment Variables**
   - Go to Variables tab
   - Add all required environment variables:
     ```
     NODE_ENV=production
     FIREBASE_API_KEY=your_firebase_api_key
     FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     FIREBASE_APP_ID=your_app_id
     FIREBASE_MEASUREMENT_ID=your_measurement_id
     SERVICE_ACCOUNT_JSON={"type":"service_account",...}
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your_email@gmail.com
     SMTP_PASS=your_app_password
     MAIL_FROM=your_email@gmail.com
     ```

4. **Deploy**
   - Railway will automatically deploy on every push to main
   - Your app will be available at the provided Railway URL

## Render Deployment

### Prerequisites
- Render account
- GitHub repository

### Steps

1. **Create Web Service**
   - Go to [Render.com](https://render.com)
   - Sign in with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `rt-employee-task-manager-server`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - Go to Environment tab
   - Add all required variables (same as Railway)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your app will be available at the provided Render URL

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `4000` |
| `FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-123` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | `123456789` |
| `FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` |
| `SERVICE_ACCOUNT_JSON` | Firebase service account | `{"type":"service_account",...}` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `user@gmail.com` |
| `SMTP_PASS` | Email password | `app_password` |
| `MAIL_FROM` | From email address | `noreply@company.com` |

## GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### For Railway Deployment
- `RAILWAY_TOKEN`: Your Railway token
- `RAILWAY_SERVICE`: Your Railway service name

#### For Render Deployment
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID

### Getting API Keys

#### Railway Token
1. Go to [Railway Account Settings](https://railway.app/account/tokens)
2. Click "Create Token"
3. Copy the generated token

#### Render API Key
1. Go to [Render Account Settings](https://dashboard.render.com/account/api-keys)
2. Click "Create API Key"
3. Copy the generated key

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for syntax errors in code

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify JSON format for SERVICE_ACCOUNT_JSON

3. **Firebase Connection**
   - Verify Firebase project is active
   - Check service account permissions
   - Ensure Firestore is enabled

4. **Email Issues**
   - Verify SMTP credentials
   - Check Gmail app password (if using Gmail)
   - Ensure SMTP settings are correct

### Logs and Debugging

#### Railway
- Go to your service dashboard
- Click on "Deployments" tab
- View logs for each deployment

#### Render
- Go to your service dashboard
- Click on "Logs" tab
- View real-time logs

## Production Checklist

- [ ] Environment variables configured
- [ ] Firebase project set up
- [ ] Email service configured
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Error tracking configured

## Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check GitHub Actions logs
4. Create an issue in the repository

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys and passwords
- Enable two-factor authentication on all services
- Use HTTPS in production
- Implement proper CORS settings
