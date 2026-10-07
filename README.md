# CampusOS

A unified digital campus platform for City University.

> **Tagline:** "One Campus. One Platform. Everything You Need."

---

## 📌 Project Overview

**CampusOS** is engineered to consolidate fragmented campus communication, events, student services, and academic support into a single authoritative digital platform for City University. 

By replacing disjointed channels (Facebook groups, private chats, paper boards, and unorganized forms), CampusOS provides students and faculty with a reliable, cohesive digital environment.

---

## 🚦 Current Development Status

- **Phase:** **STEP 1 — Project Foundation & Basic Visual Shell**
- **Status:** **Foundation Completed**

The application currently features:
- Next.js App Router core architecture
- Responsive navigation shell (Desktop & Mobile)
- University brand styling and semantic color system
- Landing page with Hero, Problem, and Product Vision sections
- Foundation modular directories (`app`, `components`, `components/ui`, `lib`, `types`, `public`)

*Note: In accordance with Step 1 requirements, backend databases, authentication, AI services, and interactive module logic (Events, Resource Hub, Helpdesk, Lost & Found) are not yet implemented and will be introduced in subsequent steps.*

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Library:** [React](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Design Tokens:** University Blue (`#2563EB`), Dark Navy (`#0F172A`), Neutral Surface (`#F8FAFC`, `#FFFFFF`)

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18.17.0+ or v20.x+
- **npm** or package manager of choice

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 4. Build for Production

```bash
npm run build
npm run start
```

### 5. Type Checking

```bash
npm run type-check
```

---

## 📁 Project Architecture

```
├── app/
│   ├── globals.css         # Tailwind global styles & directives
│   ├── layout.tsx          # Root layout with responsive Navbar & Footer
│   └── page.tsx            # Landing page (Hero, Problem, Vision)
├── components/
│   ├── ui/                 # Reusable primitive UI components
│   │   ├── badge.tsx       # Semantic badge component
│   │   ├── button.tsx      # Button with variants and sizes
│   │   └── card.tsx        # Card layout component
│   ├── footer.tsx          # Professional university footer
│   ├── hero-section.tsx    # Hero section with primary CTA
│   ├── navbar.tsx          # Responsive navigation header
│   ├── problem-section.tsx # Problem & transition breakdown
│   └── vision-section.tsx  # Product vision capability cards
├── lib/
│   └── utils.ts            # Shared utilities (class merger)
├── public/                 # Static assets & public files
├── types/
│   └── index.ts            # Shared TypeScript type definitions
├── .env.example            # Environment configuration template
├── tailwind.config.ts      # Tailwind brand theme & design system
├── tsconfig.json           # TypeScript configuration
└── next.config.mjs         # Next.js configuration
```

---

## 📄 License & Attribution

Developed for City University.  
© 2026 CampusOS. All rights reserved.
