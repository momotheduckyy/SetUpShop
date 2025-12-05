# Quick Deploy Checklist

Follow these steps to deploy SetUpShop to Render:

## ✅ Pre-Deployment (Already Done!)

- [x] Created `requirements.txt` for Python dependencies
- [x] Updated all database paths to use environment variables
- [x] Configured CORS for production
- [x] Updated frontend to use environment variable for API URL
- [x] Created `render.yaml` deployment blueprint
- [x] Created `.env.example` files for reference
- [x] Created comprehensive `DEPLOYMENT.md` guide

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
cd /Users/benfrankstein/Projects/SetUpShop

# Add all changes
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Push to GitHub
git push origin main
```

### 2. Deploy on Render

1. Go to https://render.com and sign in
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository: `SetUpShop`
5. Render will detect `render.yaml`
6. Click "Apply"
7. Wait 5-10 minutes for deployment

### 3. Get Your URLs

After deployment completes:
- Frontend: `https://setupshop-frontend.onrender.com` (or your custom name)
- Backend: `https://setupshop-backend.onrender.com`

### 4. Upload Databases

1. Go to Backend Service → "Shell" tab
2. Run:
   ```bash
   ls /opt/render/project/db
   ```
3. If empty, upload your database files from `db/` folder:
   - `equipment.db`
   - `users.db`
   - `shop_spaces.db`

**How to upload:**
- Use Render's file upload feature in the Shell tab, OR
- Copy database content using commands, OR
- Create a seed script to populate fresh databases

### 5. Test Your Deployment

Visit your frontend URL and test:
- [ ] User login works
- [ ] Equipment catalog loads
- [ ] Can create shop space
- [ ] Can add equipment to shop
- [ ] Maintenance schedule works

## 🔧 If Something Goes Wrong

### Check Backend Logs
```
Render Dashboard → setupshop-backend → Logs
```

### Check Frontend Build
```
Render Dashboard → setupshop-frontend → Logs
```

### Common Fixes

1. **CORS Error**: Update `FRONTEND_URL` in backend environment variables
2. **Database Not Found**: Upload databases to persistent disk
3. **Cold Start**: First request takes 30s (free tier limitation)

## 📝 Environment Variables to Set (If Not Auto-Configured)

### Backend Service
```
FLASK_ENV=production
DB_PATH=/opt/render/project/db
FRONTEND_URL=https://your-frontend-name.onrender.com
```

### Frontend Service
```
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

## 🎓 Share with Your Class

Once deployed, share this URL with your class:
```
https://setupshop-frontend.onrender.com
```

Test account (create one for demo):
- Username: demo
- Password: demo123

---

Need detailed help? See `DEPLOYMENT.md` for the full guide!
