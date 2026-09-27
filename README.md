# AGX Website & CRM System

Modern, high-performance AI Automation Agency website and enterprise CRM dashboard built with React 19, Vite, TypeScript, and Supabase.

## Features
- **Agency Landing Page**: Interactive ROI & Cost Calculators, Grand Slam Stack showcase, Task Eliminator, Testimonials, Case Studies, and Consultation Booking.
- **Enterprise CRM**: Complete Admin Portal with Kanban Boards, Client Management, Project Timelines, Invoice Generation & PDF Export, Vault/Credentials Storage, Calendar, and Audit Logs.
- **Client Issue Portal**: Dedicated self-service portal for clients to report issues and track resolution status in real time.
- **Netlify & Cloud Optimized**: Pre-configured SPA rewrite rules, security headers, optimized bundle chunking, and immutable asset caching.

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm** or **pnpm**

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your credentials if using custom backend instances:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Deploying to Netlify

This repository is pre-configured for one-click deployment to Netlify:

1. **Push to GitHub**: Connect your GitHub repository (`agx_website`) in Netlify.
2. **Build Settings** (automatically read from [`netlify.toml`](./netlify.toml)):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
   - **Node Version**: 22
3. **Environment Variables** (Netlify Dashboard > Site Configuration > Environment Variables):
   - `VITE_SUPABASE_URL` (optional, default fallback configured)
   - `VITE_SUPABASE_ANON_KEY` (optional, default fallback configured)
   - `API_AUTH_TOKEN` (optional, custom token for securing `/api/mcp` endpoints)
4. **Deploy**: Click **Deploy site**. SPA routing redirects, serverless API functions, and security headers are automatically configured via `netlify.toml` and `public/_redirects`.
