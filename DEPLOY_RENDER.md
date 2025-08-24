# Deploying ScholarTrack on Render.com

This guide will walk you through deploying ScholarTrack on Render.com using Docker.

## Prerequisites

- A Render.com account
- Your ScholarTrack code in a Git repository (GitHub, GitLab, etc.)
- Docker knowledge (basic understanding)

## Step 1: Prepare Your Repository

Ensure your repository contains:
- `Dockerfile` (already included in the project)
- `render.yaml` (already included in the project)
- All source code files

## Step 2: Create a New Web Service on Render

1. **Log into Render.com** and click "New +"
2. **Select "Web Service"**
3. **Connect your repository** (GitHub, GitLab, etc.)
4. **Choose your ScholarTrack repository**

## Step 3: Configure the Web Service

### Basic Settings
- **Name**: `scholartrack` (or your preferred name)
- **Environment**: `Docker`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (root of repository)

### Build & Deploy Settings
- **Build Command**: Leave empty (Docker handles this)
- **Start Command**: Leave empty (Docker handles this)

## Step 4: Environment Variables

Click on "Environment" tab and add the following variables:

### Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port for the application (Render will override this) |
| `DB_PATH` | `/opt/render/project/src/data/scholartrack.db` | SQLite database path |
| `VITE_API_URL` | `https://your-app-name.onrender.com/api` | Frontend API URL (replace with your actual Render URL) |
| `VITE_TEACHER_CODE` | `456789` | Default 6-digit teacher code |

### Optional Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_APP_TITLE` | `ScholarTrack` | Application title |
| `VITE_APP_VERSION` | `1.0.0` | Application version |

### Security Considerations

- **Change the default teacher code** (`VITE_TEACHER_CODE`) to a secure 6-digit code
- **Never commit sensitive codes** to your repository
- **Use Render's environment variable encryption** for sensitive data

## Step 5: Advanced Settings

### Health Check Path
- **Health Check Path**: `/api/health` (if you add a health endpoint)

### Auto-Deploy
- **Auto-Deploy**: Enable for automatic deployments on push
- **Branch**: `main` (or your preferred branch)

## Step 6: Deploy

1. **Click "Create Web Service"**
2. **Wait for the build** (usually 5-10 minutes)
3. **Monitor the logs** for any errors

## Step 7: Verify Deployment

Once deployed, your application will be available at:
```
https://your-app-name.onrender.com
```

### Test the following:
1. **Frontend loads** correctly
2. **Teacher code works** (default: `456789`)
3. **Student management** functions
4. **Reports generation** works
5. **Data persistence** (SQLite database)

## Troubleshooting

### Common Issues

#### Build Fails
- **Check Dockerfile**: Ensure it's in the root directory
- **Check render.yaml**: Verify configuration
- **Check logs**: Look for specific error messages

#### Environment Variables Not Working
- **Verify variable names**: Case-sensitive
- **Check API URL**: Must match your Render service URL
- **Restart service**: After changing environment variables

#### Database Issues
- **Check DB_PATH**: Ensure directory is writable
- **Check permissions**: Render should handle this automatically
- **Verify SQLite**: Database should be created automatically

#### Frontend Can't Connect to Backend
- **Check VITE_API_URL**: Must be the full Render URL
- **Verify CORS**: Backend should allow frontend domain
- **Check network**: Ensure no firewall issues

### Logs and Debugging

1. **View build logs** in Render dashboard
2. **Check runtime logs** for errors
3. **Test API endpoints** directly
4. **Verify environment variables** are set correctly

## Custom Domain (Optional)

1. **Go to Settings** → **Custom Domains**
2. **Add your domain**
3. **Update DNS records** as instructed
4. **Update VITE_API_URL** to use your custom domain

## Scaling Considerations

### Free Tier Limitations
- **Sleep after inactivity**: Service will sleep after 15 minutes
- **Cold start**: First request after sleep may be slow
- **Bandwidth limits**: Check Render's current limits

### Paid Tier Benefits
- **Always on**: No sleep mode
- **Better performance**: More resources
- **Custom domains**: SSL certificates included
- **Higher limits**: More bandwidth and build minutes

## Security Best Practices

1. **Change default teacher code** immediately after deployment
2. **Use HTTPS**: Render provides this automatically
3. **Regular updates**: Keep dependencies updated
4. **Monitor logs**: Check for suspicious activity
5. **Backup data**: Consider database backups for important data

## Support

If you encounter issues:
1. **Check Render documentation**: https://render.com/docs
2. **Review application logs** in Render dashboard
3. **Verify environment variables** are set correctly
4. **Test locally** with Docker to isolate issues

## Example render.yaml

Your project already includes a `render.yaml` file, but here's what it should contain:

```yaml
services:
  - type: web
    name: scholartrack
    env: docker
    plan: free
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DB_PATH
        value: /opt/render/project/src/data/scholartrack.db
      - key: VITE_API_URL
        value: https://your-app-name.onrender.com/api
      - key: VITE_TEACHER_CODE
        value: 456789
```

Remember to replace `your-app-name` with your actual Render service name.
