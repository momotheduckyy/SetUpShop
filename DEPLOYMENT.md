# SetUpShop Deployment Guide for Render

This guide will help you deploy the SetUpShop application to Render.

## Prerequisites

1. GitHub account
2. Render account (free at https://render.com)
3. Your code pushed to a GitHub repository

## Step 1: Prepare Your Databases

Before deploying, you need to copy your database files to the Render persistent disk OR seed new databases.

### Option A: Upload Existing Databases (Recommended for Class Demo)

After your backend service is deployed with persistent disk:

1. Go to your Render Dashboard → Backend Service → Shell
2. Run these commands to check disk is mounted:
   ```bash
   cd /opt/render/project
   mkdir -p db
   ```
3. Upload your database files using Render's file upload feature or copy content manually

### Option B: Seed Fresh Databases

Create a seed script to initialize databases with demo data for your class presentation.

## Step 2: Deploy to Render

### Method 1: Using render.yaml Blueprint (Easiest)

1. **Push your code to GitHub** (make sure render.yaml is committed)

2. **Sign up/Login to Render** at https://render.com

3. **Create New Blueprint**:
   - Go to Dashboard → "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository
   - Render will automatically detect `render.yaml`
   - Click "Apply"

4. **Wait for deployment** (5-10 minutes):
   - Backend will deploy first
   - Frontend will deploy after backend is ready
   - Watch the logs for any errors

5. **Configure Environment Variables** (if not auto-configured):
   - Backend service:
     - `FLASK_ENV` = `production`
     - `DB_PATH` = `/opt/render/project/db`
     - `FRONTEND_URL` = (copy your frontend URL like `https://setupshop-frontend.onrender.com`)

   - Frontend service:
     - `VITE_API_BASE_URL` = (copy your backend URL like `https://setupshop-backend.onrender.com/api`)

### Method 2: Manual Deployment

#### Deploy Backend:

1. **Create Web Service**:
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: setupshop-backend
     - **Region**: Oregon (or closest to you)
     - **Branch**: main
     - **Root Directory**: (leave empty)
     - **Runtime**: Python 3
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && python server.py`
     - **Plan**: Free

2. **Add Environment Variables**:
   - `FLASK_ENV` = `production`
   - `DB_PATH` = `/opt/render/project/db`
   - `FRONTEND_URL` = (will add after frontend is deployed)

3. **Add Persistent Disk**:
   - Go to service → "Disks" tab
   - Add disk:
     - **Name**: db-storage
     - **Mount Path**: `/opt/render/project/db`
     - **Size**: 1 GB
   - Click "Create"

4. **Copy Backend URL** (e.g., `https://setupshop-backend.onrender.com`)

#### Deploy Frontend:

1. **Create Static Site**:
   - Dashboard → "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: setupshop-frontend
     - **Branch**: main
     - **Root Directory**: (leave empty)
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
     - **Plan**: Free

2. **Add Environment Variable**:
   - `VITE_API_BASE_URL` = `https://setupshop-backend.onrender.com/api` (your backend URL)

3. **Copy Frontend URL** (e.g., `https://setupshop-frontend.onrender.com`)

4. **Update Backend CORS**:
   - Go back to backend service
   - Add/Update environment variable:
     - `FRONTEND_URL` = `https://setupshop-frontend.onrender.com` (your frontend URL)
   - Backend will redeploy automatically

## Step 3: Upload Equipment Images

Your equipment images need to be accessible to the frontend. Two options:

### Option A: Bundle with Frontend (Current Setup)

1. Make sure all images are in `frontend/public/equipment-images/`
2. They'll be deployed automatically with the frontend
3. No additional setup needed

### Option B: Use Backend to Serve Images

1. Move images to `backend/static/equipment-images/`
2. Update image paths in code to use backend URL
3. Flask will serve them as static files

## Step 4: Initialize Databases

After both services are deployed:

1. **Go to Backend Service → Shell** (tab in Render dashboard)

2. **Check disk is mounted**:
   ```bash
   ls /opt/render/project/db
   ```

3. **Upload your databases** or run seed scripts:
   ```bash
   # Example: copy from repo/init-database.sh if you have one
   cd /opt/render/project
   python backend/seed_databases.py
   ```

4. **Verify databases exist**:
   ```bash
   ls -lh /opt/render/project/db/
   ```
   You should see:
   - `equipment.db`
   - `users.db`
   - `shop_spaces.db`

## Step 5: Test Your Deployment

1. **Visit your frontend URL** (e.g., `https://setupshop-frontend.onrender.com`)

2. **Test key features**:
   - User login/registration
   - View equipment catalog
   - Create shop space
   - Add equipment to shop
   - View maintenance schedule

3. **Check for errors**:
   - Open browser console (F12)
   - Look for CORS or API errors
   - Check backend logs in Render dashboard

## Common Issues & Fixes

### Issue: "CORS Error"
**Fix**: Make sure `FRONTEND_URL` environment variable in backend matches your actual frontend URL exactly (no trailing slash).

### Issue: "Database file not found"
**Fix**:
1. Check persistent disk is mounted: `ls /opt/render/project/db`
2. Verify `DB_PATH` environment variable is set to `/opt/render/project/db`
3. Upload/seed your databases

### Issue: "Backend service offline" / 404 errors
**Fix**:
- Free tier spins down after 15min inactivity
- First request after spin-down takes ~30 seconds (cold start)
- This is normal for free tier

### Issue: Frontend shows old code after deployment
**Fix**:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Verify frontend build succeeded in Render logs
3. Check `VITE_API_BASE_URL` is set correctly

### Issue: Images not loading
**Fix**:
1. Check images are in `frontend/public/equipment-images/`
2. Verify image paths in database match filenames
3. Check browser console for 404 errors

## Free Tier Limitations

- **Backend**: Spins down after 15 minutes of inactivity (30s cold start)
- **Frontend**: Always on, fast
- **Disk**: $0.25/GB/month (1GB disk = ~$0.25/month)
- **Database**: Free SQLite on disk (vs $7/month for PostgreSQL)

## Updating Your Deployment

When you push changes to GitHub:

1. **Auto-Deploy** (if enabled):
   - Render automatically detects push
   - Rebuilds and redeploys
   - Takes 3-5 minutes

2. **Manual Deploy**:
   - Go to Render Dashboard → Service
   - Click "Manual Deploy" → "Deploy latest commit"

## URLs for Your Class

After deployment, share these URLs:

- **Frontend**: `https://setupshop-frontend.onrender.com`
- **Backend API** (for testing): `https://setupshop-backend.onrender.com/api/health`

## Environment Variables Summary

### Backend (`setupshop-backend`)
```
FLASK_ENV=production
DB_PATH=/opt/render/project/db
FRONTEND_URL=https://setupshop-frontend.onrender.com
PORT=10000  # Render sets this automatically
```

### Frontend (`setupshop-frontend`)
```
VITE_API_BASE_URL=https://setupshop-backend.onrender.com/api
```

## Need Help?

1. Check Render logs: Dashboard → Service → Logs
2. Use Render Shell: Dashboard → Service → Shell
3. Review this deployment guide
4. Check Render docs: https://render.com/docs

Good luck with your class presentation! 🚀
