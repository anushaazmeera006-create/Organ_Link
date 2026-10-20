# OrganLink Deployment Guide

## Deploy to Render.com (Free PostgreSQL + Web Hosting)

### STEP 1: Go to Render.com

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New+"** → **"Web Service"**

### STEP 2: Connect GitHub Repository

1. Click **"Connect GitHub"** (authorize if needed)
2. Select your repository: `anushaazmeera006-create/OrganLink`
3. Click **"Connect"**

### STEP 3: Configure Build Settings

1. **Name**: `organlink` (or your preferred name)
2. **Branch**: `main`
3. **Runtime**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. Click **"Advanced"** and add:
   - **Instance Type**: `Free`

### STEP 4: Add PostgreSQL Database

1. In your Render dashboard, click **"New+"** → **"PostgreSQL"**
2. Name it: `organlink-db`
3. Select **Free** tier
4. Click **"Create Database"**
5. Wait 1-2 minutes for database to be created

### STEP 5: Configure Environment Variables

1. Click on your web service (organlink)
2. Go to **"Environment"** tab
3. Add these variables:
   - `DB_HOST`: Your PostgreSQL internal host (from database dashboard)
   - `DB_USER`: Your PostgreSQL username (from database dashboard)
   - `DB_PASSWORD`: Your PostgreSQL password (from database dashboard)
   - `DB_NAME`: Your database name (usually same as database name)
   - `DB_PORT`: `5432`
   - `JWT_SECRET`: `organlink_secret_key_2024`

### STEP 6: Initialize Database Schema

1. Go to your PostgreSQL database in Render
2. Click **"Connect"** → **"External Connection"**
3. Use the connection string to connect with a PostgreSQL client
4. Run the contents of `init_postgres.sql` file
5. This will create all tables and the matching function

### STEP 7: Deploy

1. Click **"Create Web Service"** on your web service
2. Wait for deployment to complete (2-3 minutes)
3. Your app will be available at: `https://organlink.onrender.com`

### STEP 8: Test Your Application

1. Open your Render URL
2. Check if dashboard loads with data
3. Test adding donors, recipients
4. Test the matching algorithm
5. Verify all features work

### IMPORTANT NOTES:

- **Render provides free PostgreSQL database**
- **Free web hosting with auto-sleep (wakes on request)**
- **Your link will stay active as long as your account is active**
- **Database is PostgreSQL (migrated from MySQL)**
- **All functionality preserved**

---

## Important Notes

### Database Initialization
Your `init.sql` file needs to be executed on the cloud database. Options:
1. Use a MySQL client to connect and run the SQL file
2. Add initialization code to `db.js` that runs on first startup
3. Use the database provider's web console to run SQL

### Environment Variables
Never commit your `.env` file to GitHub. Use the platform's environment variable management instead.

### Troubleshooting
- If data doesn't load, check the database connection in the logs
- Ensure CORS is properly configured for your production domain
- Verify all API routes are accessible without authentication
- Check that the database schema matches your queries

### Performance Considerations
- Free tiers may have limitations on database connections
- Consider implementing connection pooling for better performance
- Add error handling for database timeouts
