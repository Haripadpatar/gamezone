# CampusCompass - Full Stack College Discovery Platform

CampusCompass is a premium college discovery and comparison platform built as a production-quality application. It is designed to emulate modern startup aesthetics (Stripe/Linear/Vercel dashboards) with clean typography, responsive grid/list listing layouts, dynamic comparison slots, and real-time database integrations.

---

## 🚀 Key Features

1. **Authentication (NextAuth)**: Credentials provider for Sign Up, Login, and Session-managed routes.
2. **Interactive Search & Filter**: Live text search, location drop-downs, and an interactive annual fee slider. Supports grid and list views.
3. **Deep Comparison Matrix**: Autocomplete selectors to load up to 3 colleges side-by-side. Highlights the best performer in key metrics (Lowest Fee, Best Placements, Top Rated).
4. **Rich Detail View**: Dynamic placement success charts, course catalogs, student reviews, and related recommendations.
5. **Shortlist Dashboard**: Personal board to track, remove, or batch-compare saved colleges.
6. **Live Reviews**: Authenticated users can submit star ratings and detailed comments, updating the college's average ratings in real-time.

---

## 🛠️ Technology Stack

* **Framework**: Next.js 15 (App Router, dynamic and static route handlers)
* **Frontend**: React 19, TypeScript, Tailwind CSS v4 (inline theme tokens)
* **Database**: PostgreSQL (relational structure)
* **ORM**: Prisma 7 (using PG driver adapters)
* **Auth**: NextAuth v4 (with JWT session tracking)

---

## 📂 Project Architecture

```
CampusCompass/
├── prisma/
│   ├── schema.prisma         # Relational database models
│   └── seed.ts               # Seeding script with 10+ detailed colleges
├── src/
│   ├── app/
│   │   ├── api/              # Route handlers (auth, colleges, saved, reviews)
│   │   ├── colleges/         # List and details pages
│   │   ├── compare/          # Side-by-side comparison page
│   │   ├── dashboard/        # Shortlisted colleges board
│   │   ├── login/ /signup/   # Auth forms
│   │   └── page.tsx          # Featured landing page
│   ├── components/
│   │   ├── layout/           # Sticky Navbar, Footer
│   │   ├── ui/               # Contextual slide-in Toast notifications
│   │   └── college/          # SaveButton, ReviewForm
│   ├── lib/
│   │   ├── auth.ts           # NextAuth credentials validation
│   │   ├── db.ts             # Prisma Client singleton with PG adapter
│   │   └── utils.ts          # Currency and percentage format helpers
│   └── types/                # Shared TypeScript definitions
```

---

## ⚙️ Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and a running **PostgreSQL** instance.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/campuscompass"
NEXTAUTH_SECRET="f3b909569fa190bc1f4bb2a74cde6c5ea3e93a65239121a9a834bf5e2cb83210"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Create Database & Apply Migrations
Apply the migrations to sync the PostgreSQL database structure:
```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Seed the Database
Seed the database with 10 top engineering, business, and medical colleges across India, complete with initial reviews and a test user:
```bash
npx prisma db seed
```

---

## 🔑 Seeding Credentials for Testing

Use the following credentials to log in and test saved boards or write student reviews:
* **Email**: `john@example.com`
* **Password**: `password123`

---

## 💻 Running the Application

Start the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
```
deploy trigger
