# Hostinger Node.js & MySQL Deployment SOP

## Goal
Standard Operating Procedure for deploying the unified AGX monolithic Node.js application (Express backend + Vite React frontend) and importing the native MySQL CRM database onto Hostinger for `agxperience.com`.

## Inputs
- Hostinger hPanel login access for `agxperience.com`.
- Database schema: `database/mysql_schema.sql` (21 tables).
- Initial seed data: `database/mysql_seed.sql`.
- Server configuration: `server.js` and `server/db.js`.
- Frontend production bundle in `dist/`.
- Environment template: `.env.production.example`.

## Architecture Overview
- **Runtime**: Node.js 20 LTS on Hostinger Cloud / Web Hosting.
- **Web Server Proxy**: LiteSpeed with `.htaccess` proxy rules to local Node port.
- **Database**: Hostinger native MySQL 8.0 / MariaDB on `localhost:3306`.
- **API Surface**: Express REST API under `/api/crm/*` and `/api/auth/*`.
- **Frontend**: Vite Single-Page Application served statically with SPA fallback to `index.html`.

## Step-by-Step Procedure

### 1. Build & Verify Frontend Bundle
```bash
npm run build
```
Verify that `dist/index.html` and assets in `dist/assets/` are created.

### 2. Hostinger hPanel: Create MySQL Database
1. Go to **Databases** -> **Management** in hPanel.
2. Under "Create a New MySQL Database and User":
   - Database Name: e.g. `u123456789_agx`
   - Database User: e.g. `u123456789_admin`
   - Password: Set a secure password.
3. Click **Create** and record the database name, user, and password.

### 3. Hostinger hPanel: Import Database Schema via phpMyAdmin
1. Click **Enter phpMyAdmin** next to the created database.
2. Select the database in the left sidebar.
3. Click the **Import** tab.
4. Upload `database/mysql_schema.sql` and click **Go**.
5. (Optional) Repeat with `database/mysql_seed.sql` to populate initial admin profile and sample records.

### 4. Hostinger hPanel: Configure Node.js Application
1. In hPanel, navigate to **Advanced** -> **Node.js**.
2. Settings:
   - Node.js Version: `20.x LTS`
   - Application Root: `public_html`
   - Application Startup File: `server.js`
3. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3000` (or assigned port)
   - `DB_HOST=localhost`
   - `DB_USER=<your_db_username>`
   - `DB_PASSWORD=<your_db_password>`
   - `DB_NAME=<your_db_name>`
   - `JWT_SECRET=<your_secure_jwt_secret>`
4. Upload project files (or upload deployment zip when requested).
5. Click **NPM Install** in the Node.js control panel.
6. Click **Restart Application**.

### 5. Verification & Health Check
1. Test API Health: `https://agxperience.com/api/health`
   Expected response:
   ```json
   {
     "status": "healthy",
     "environment": "production",
     "database": { "connected": true, "host": "localhost" }
   }
   ```
2. Test Main Website: `https://agxperience.com`
3. Test CRM Portal: `https://agxperience.com/crm`

## Troubleshooting & Edge Cases
- **Database Connection Refused**: Ensure `DB_HOST=localhost` and that the database user was granted full permissions when created in hPanel.
- **Port Conflicts**: Hostinger automatically assigns the listening port via `process.env.PORT`. `server.js` dynamically uses `process.env.PORT || 3000`.
- **Client Route 404s**: Ensure `.htaccess` exists in `public_html` and `server.js` contains the SPA fallback `app.use((req, res) => res.sendFile(...))`.
