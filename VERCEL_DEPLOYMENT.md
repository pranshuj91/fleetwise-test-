# Vercel Deployment Guide

## ✅ Fixed: 404 Error Resolution

The 404 error has been fixed by adding proper Vercel configuration for React Router (SPA routing).

## Configuration Files Created

1. **`vercel.json`** (root) - For deployment from repository root
2. **`frontend/vercel.json`** - For deployment when root directory is set to `frontend`

## Vercel Project Settings

### Option 1: Deploy from Root (Recommended)

If deploying from repository root, Vercel will use `vercel.json`:

**Settings:**
- **Root Directory:** (leave empty or set to `.`)
- **Build Command:** `cd frontend && npm install && npm run build`
- **Output Directory:** `frontend/build`
- **Install Command:** `cd frontend && npm install`

### Option 2: Deploy from Frontend Folder

If setting root directory to `frontend`:

**Settings:**
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

## Key Fix: React Router Rewrites

The critical fix is the `rewrites` configuration that handles client-side routing:

```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

This ensures all routes (like `/trucks`, `/projects`, etc.) are served the `index.html` file, allowing React Router to handle routing on the client side.

## Deployment Steps

1. **Connect Repository to Vercel:**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Import from GitHub: `pranshuj91/fleetwise-test-`

2. **Configure Build Settings:**
   - Choose one of the options above
   - Vercel should auto-detect the configuration

3. **Environment Variables (Optional for now):**
   - `REACT_APP_SUPABASE_URL` - (Will be added by Lovable)
   - `REACT_APP_SUPABASE_ANON_KEY` - (Will be added by Lovable)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - App should now work without 404 errors!

## Testing the Fix

After deployment, test these routes:
- `/` - Should load Dashboard
- `/trucks` - Should load Truck List
- `/projects` - Should load Project List
- `/login` - Should load Login page

All routes should work without 404 errors.

## Troubleshooting

If you still see 404 errors:

1. **Check Build Logs:**
   - Ensure build completes successfully
   - Check for any errors in the build output

2. **Verify Configuration:**
   - Ensure `vercel.json` is in the correct location
   - Check that `rewrites` configuration is present

3. **Clear Cache:**
   - In Vercel dashboard, go to Deployments
   - Redeploy the latest deployment

4. **Check Root Directory:**
   - Ensure root directory setting matches your `vercel.json` location

## What Was Fixed

✅ Added `vercel.json` with React Router rewrites
✅ Configured proper build commands
✅ Set correct output directory
✅ Added cache headers for static assets
✅ Created deployment documentation

---

**Status:** ✅ Ready for Vercel deployment
**404 Error:** ✅ Fixed with rewrites configuration

