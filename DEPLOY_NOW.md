# 🚀 Ready to Deploy - Run These Commands Now!

Everything is prepared for Render deployment. Follow these exact steps:

## Step 1: Commit and Push Changes

```bash
cd /Users/benfrankstein/Projects/SetUpShop

# Add all the deployment files we just created
git add .

# Commit with a descriptive message
git commit -m "Configure for Render deployment - add env vars, render.yaml, and deployment docs"

# Push to GitHub (you're on the 'hosting' branch)
git push origin hosting
```

## Step 2: Merge to Main (If Needed)

If your class needs the main branch:

```bash
git checkout main
git merge hosting
git push origin main
```

## Step 3: Deploy on Render

### Option A: Using Blueprint (Easiest - Recommended!)

1. Go to https://render.com
2. Sign up / Log in
3. Click **"New +"** → **"Blueprint"**
4. Click **"Connect GitHub"** (if not already connected)
5. Find and select repository: **"SetUpShop"**
6. Render will detect `render.yaml` automatically
7. Review the services (backend + frontend)
8. Click **"Apply"**
9. ⏰ Wait 5-10 minutes for deployment

### Option B: Manual Setup (More Control)

See `DEPLOYMENT.md` for detailed manual setup instructions.

## Step 4: After Deployment Succeeds

### A. Get Your URLs

In Render Dashboard, you'll see two services:
- **setupshop-backend**: Copy the URL (e.g., `https://setupshop-backend-xyz.onrender.com`)
- **setupshop-frontend**: Copy the URL (e.g., `https://setupshop-frontend-xyz.onrender.com`)

### B. Update Environment Variables (Double-Check)

**Backend Service:**
1. Go to Backend Service → "Environment" tab
2. Verify these are set:
   - `FLASK_ENV` = `production`
   - `DB_PATH` = `/opt/render/project/db`
   - `FRONTEND_URL` = (paste your actual frontend URL)

**Frontend Service:**
1. Go to Frontend Service → "Environment" tab
2. Verify this is set:
   - `VITE_API_BASE_URL` = (paste your actual backend URL + `/api`)

Example: `https://setupshop-backend-xyz.onrender.com/api`

### C. Upload Your Databases

1. Go to Backend Service → **"Shell"** tab
2. Verify disk is mounted:
   ```bash
   ls /opt/render/project/db
   ```
3. If empty, you need to upload your 3 database files

**Methods to Upload:**

**Method 1: Use Render's File Upload Feature**
- Look for file upload icon in Shell tab
- Upload:
  - `/Users/benfrankstein/Projects/SetUpShop/db/equipment.db`
  - `/Users/benfrankstein/Projects/SetUpShop/db/users.db`
  - `/Users/benfrankstein/Projects/SetUpShop/db/shop_spaces.db`

**Method 2: Create Seed Script (Better for Class)**
Create `backend/seed_db.py` that initializes databases with demo data, then run:
```bash
cd /opt/render/project/backend
python seed_db.py
```

## Step 5: Test Your Live Site! 🎉

1. Visit your frontend URL
2. Test login/register
3. Try creating a shop
4. Add equipment
5. View maintenance schedule

## What to Expect

✅ **Frontend**: Loads instantly, always on
⚠️ **Backend**: First request takes ~30 seconds (free tier "cold start")
💰 **Cost**: FREE (frontend) + FREE with limitations (backend) + ~$0.25/month (1GB disk)

## Troubleshooting

### "CORS Error" in Browser Console
Fix: Update `FRONTEND_URL` in backend environment variables to match exact frontend URL (no trailing slash)

### "Failed to fetch" / Network errors
Fix: Backend is probably spinning up (cold start). Wait 30 seconds and refresh.

### "Database file not found"
Fix: Upload databases to `/opt/render/project/db` as described in Step 4C

### Images not loading
Fix: Make sure images are in `frontend/public/equipment-images/` and were included in git commit

## Share with Your Class

Once everything works:

**Your Live App**: `https://setupshop-frontend-[your-name].onrender.com`

**Demo Credentials** (create these after deployment):
- Username: `demo`
- Password: `demo123`
- Or have each student register their own account!

---

## Need Help?

1. **Detailed Guide**: See `DEPLOYMENT.md`
2. **Quick Reference**: See `QUICK_DEPLOY.md`
3. **Render Docs**: https://render.com/docs
4. **Render Logs**: Check service logs in dashboard for errors

---

# YOU'RE READY! 🚀

Run the git commands in Step 1, then head to render.com and deploy using the Blueprint method!
