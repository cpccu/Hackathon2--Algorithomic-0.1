# CampusOS — City University Prototype

> **Tagline:** "One Campus. One Platform. Everything You Need."  
> **Production URL:** [https://hackathon2-algorithomic-0-1.vercel.app/](https://hackathon2-algorithomic-0-1.vercel.app/)

---

## 📌 Overview

**CampusOS** is a unified digital campus platform built as an innovation prototype for the City University hackathon.

Campus life is traditionally fragmented across informal Facebook groups, chat threads, paper bulletin boards, and Google Forms. **CampusOS** consolidates campus information, student support, and academic services into one secure, truthful, and interconnected operating system.

> **Disclaimer:** CampusOS is a student-built hackathon prototype engineered for City University. It is not an officially operated university system or an official endorsement by City University administration. All institutional data adheres strictly to a zero-fabrication verified knowledge base.

---

## 🚀 Core Systems & Architecture

CampusOS is a fully realized full-stack production application built with Next.js 14 App Router, TypeScript, and Neon PostgreSQL:

### 1. 🔐 Passwordless Email OTP Authentication & RBAC
- Instant, secure 6-digit email OTP delivery via Nodemailer/SMTP.
- Cryptographic HMAC-SHA256 session token generation and tamper-proof session cookies.
- Role-based authorization (`STUDENT`, `ADMIN`) guarding sensitive administrative operations.

### 2. ⚡ PostgreSQL & Drizzle ORM
- Cloud PostgreSQL on Neon with relational schema migrations via Drizzle ORM.
- Normalized models for users, sessions, academic resources, campus events, registrations, lost & found items, item claims, complaints, audit logs, and in-app notifications.

### 3. 🔍 Universal Campus Search
- Cross-module indexing across verified academic departments, campus facilities, verified resources, events, FAQs, and clubs.
- Multi-token fuzzy query parsing with provenance source tagging (`Academic Repository`, `Campus Calendar`, `Smart Helpdesk`, `University Bulletin`).

### 4. 🤖 Grounded AI Smart Helpdesk
- Powered by Google Gemini 2.5 Flash via `@google/genai`.
- Strict **Zero-Fabrication** retrieval: queries are grounded exclusively in verified institutional context (departments, offices, hours, admission FAQs).
- Automated fallback to deterministic directory responses when external AI APIs are unreachable.

### 5. 🎟️ Event Engine & Digital QR Pass
- Explore upcoming campus workshops, seminars, and hackathons.
- Single-click real-time event registration with duplicate prevention and capacity controls.
- Dynamic digital event passes with SVG QR verification code generation.

### 6. 📚 Academic Resource Hub
- Verified syllabi, examination archives, question banks, and department guidelines.
- Departmental and category filtering with verified source links.

### 7. 🔍 Lost & Found + Complaint Box
- **Lost & Found:** Report lost or found campus belongings with location, date, and description. Secure claim submission workflow with admin verification.
- **Complaint Box:** Submit confidential campus and facility grievances with priority tiers (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and track admin resolution notes.

### 8. 🔔 Notification Center
- Real-time in-app notification center with unread bell badge.
- Automatic dispatch on event registrations, claim status updates, and complaint resolutions.
- Single-click mark-as-read and bulk mark-all-read operations.

### 9. 🛡️ Secure Admin Console
- Comprehensive administrative suite guarded by strict session and role verification.
- Full CRUD management across university information, departments, locations, faculty, events, resources, notices, lost & found claims, and grievances.
- Immutable security audit logs recording every administrative state mutation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Neon Cloud) |
| **ORM** | Drizzle ORM / Drizzle Kit |
| **AI / LLM** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Authentication** | Passwordless Email OTP (HMAC-SHA256 Sessions) |
| **Mailing** | Nodemailer (SMTP STARTTLS) |
| **Styling** | Tailwind CSS, Lucide React |
| **Deployment** | Vercel Edge & Serverless Functions |

---

## 🔒 Security & Data Integrity

- **Strict IDOR Protection:** Ownership validation ensures students can only view and update their own registrations, claims, and private complaints.
- **Layout Isolation:** Public landing page header/footer are strictly separated from authenticated student dashboards.
- **Zero Secrets in Git:** Sensitive connection strings and cryptographic keys reside solely in server-side environment variables.
- **Zero-Fabrication Guarantee:** The public landing page and AI services contain no fictional names, fake registration counts, or fabricated claims.

---

## ⚙️ Environment Variables

The application relies on the following server-side environment variables:

### Required for Production:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
AUTH_SECRET=your-32-byte-hex-secret
SMTP_USER=your-smtp-account@gmail.com
SMTP_PASS=your-smtp-app-password
```

### Optional / Recommended:
```env
GEMINI_API_KEY=your-google-ai-studio-key   # Enables conversational Gemini 2.5 Flash
CAMPUSOS_ADMIN_EMAIL=admin@cityuniversity.edu.bd # Auto-assigns ADMIN role
SMTP_HOST=smtp.gmail.com                  # Defaults to smtp.gmail.com
SMTP_PORT=587                             # Defaults to 587
SMTP_SECURE=false                         # Defaults to false (STARTTLS)
SMTP_SERVICE=gmail                        # Defaults to gmail
SMTP_FROM="CampusOS — City University" <your-smtp-account@gmail.com>
```

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/cpccu/Hackathon2--Algorithomic-0.1.git
cd Hackathon2--Algorithomic-0.1
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create `.env.local` in the project root with the variables listed above.

### 4. Run database migrations
```bash
npm run db:migrate
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view CampusOS.

### 6. Verify type safety & build
```bash
npm run type-check
npm run build
```

---

## 🌐 Production Deployment

- **Hosting Target:** Vercel (Next.js App Router)
- **Repository:** `cpccu/Hackathon2--Algorithomic-0.1`
- **Main Branch:** `main`
- **Live URL:** [https://hackathon2-algorithomic-0-1.vercel.app/](https://hackathon2-algorithomic-0-1.vercel.app/)
