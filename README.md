<div align="center">
  <h1>100x Socials</h1>
  <p><strong>Live Platform:</strong> <a href="https://100xsocials.joshuapaul.site/login">100xsocials.joshuapaul.site/login</a></p>
  <p>An invite-only, AI-powered professional network and talent marketplace connecting high-quality builders with top-tier tech recruiters.</p>
</div>

---

## Overview

**100x Socials** solves the noise problem in modern recruiting by entirely gating access. Builders can only join via an admin-curated whitelist, ensuring that recruiters get access to a highly vetted talent pool. The platform features passwordless authentication, role-based dashboards, and Google Gemini artificial intelligence to automate ATS stringency checks on uploaded resumes.

## Key Features

- **Invite-Only Ecosystem:** Access is strictly controlled via an Admin whitelist.
- **Passwordless Auth:** Secure OTP (One-Time Password) login flow handled via email tokens, protected by robust API rate limiting.
- **AI Resume Parsing:** Integrates Google Gemini LLMs to automatically parse uploaded PDFs, generate ATS scores, and create highly searchable tech tags.
- **Role-Based Access Control (RBAC):** Three distinct layers of access:
  - **Members:** Can build out rich profiles, manage their job status, and receive ATS feedback.
  - **Recruiters:** Access a powerful talent directory with advanced filtering.
  - **Admins:** Full control over the platform whitelist, user management, and metrics.
- **Cloud Hosted Media:** Secure avatar and raw document storage via Cloudinary.

## Tech Stack

### Frontend
- **Framework:** React 18 & Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State/Data:** Axios & React Hooks

### Backend
- **Environment:** Node.js & Express
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Third-Party Integrations:** Google Generative AI (Gemini), Cloudinary (Storage), Resend (Transactional Emails)

### Deployment Architecture
- **Frontend:** Cloudflare Pages (Global CDN with Automated CI/CD)
- **Backend:** AWS EC2 (Ubuntu) using PM2 Process Manager, Nginx Reverse Proxy, and Certbot for SSL/HTTPS.

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed locally or via Docker
- Cloudinary, Gemini, and Resend API Keys

### 1. Clone the repository
```bash
git clone https://github.com/your-username/100xsocials.git
cd 100xsocials
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on the `.env.example`:
```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/100xsocial"
JWT_SECRET="your_super_secret_key"
CLIENT_URL="http://localhost:5173"
ADMIN_EMAIL="your_admin_email@domain.com"
RESEND_API_KEY="re_..."
GEMINI_API_KEY="AIza..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```
Run database migrations and start the server:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will launch at `http://localhost:5173` and automatically proxy API requests to your local backend.

---

## Project Structure

```bash
100x-socials/
├── backend/
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── middleware/     # Rate limiters & JWT Auth checks
│   │   ├── routes/         # Express API routes (Auth, Admin, User)
│   │   └── services/       # External APIs (Cloudinary, Gemini, Resend)
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/     # Reusable React UI components
    │   ├── contexts/       # Global state (Theme, Auth)
    │   ├── hooks/          # Custom data fetching hooks
    │   └── pages/          # Full page views (Directory, Dashboards)
    ├── vite.config.ts      # Build & Dev Proxy settings
    └── tailwind.config.js  # Theme styling parameters
```

---

## License
This project is proprietary and confidential.
