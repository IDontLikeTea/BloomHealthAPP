# Bloom - AI-Powered Compassionate Health Tracker

Bloom is a modern, responsive, and compassionate health tracking web application built using **Next.js**, **Prisma**, **PostgreSQL**, and **Tailwind CSS**. It helps users track meals, hydration, workouts, and customize their health targets while interacting with an encouraging AI Health Companion.

---

## Key Features

- 📸 **AI Meal Scanner & Analyzer**: Snap a photo or log meal names to automatically estimate calories and macronutrients (protein, carbs, fat) using AI.
- 💬 **AI Health Companion (Bloom)**: A supportive, gentle, and encouraging AI assistant built-in to offer personalized nutrition advice, meal suggestions, and active listening.
- 📊 **Detailed Analytics**: Track progress over time with responsive charts, weekly summaries, and calorie/macro breakdowns.
- 🎯 **Compassionate Goal Tracking**: Set and monitor daily calorie, water, and exercise goals. Includes a "Compassionate Mode" toggle for gentle guidance instead of strict warnings.
- 💧 **Hydration Tracker**: Easy click logging of water intake to stay hydrated throughout the day.
- 🏃‍♂️ **Exercise Logger**: Log workouts (cardio, strength, flexibility, sports) and calculate calories burned.
- 🎨 **Customizable Widget**: Customize the dashboard tracker widget's shape (heart, cloud, circle, etc.) and gradients to match your style.
- 🔒 **Secure Authentication**: Built with NextAuth.js supporting secure Credentials login and Google OAuth.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) (animations) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma Client](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [Yarn](https://yarnpkg.com/) or [NPM](https://www.npmjs.com/)
- PostgreSQL database instance

### 2. Install Dependencies

Clone the repository and run:

```bash
# Using Yarn
yarn install

# Using NPM
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and configure the environment variables:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/bloom_db?schema=public"

# NextAuth config
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_key"

# AI & API keys
ABACUSAI_API_KEY="your_abacus_ai_api_key"
WEB_APP_ID="your_web_app_id"

# Storage config (AWS S3)
AWS_REGION="us-west-2"
AWS_BUCKET_NAME="your_s3_bucket_name"
AWS_FOLDER_PREFIX="uploads/"

# OAuth Credentials (Optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 4. Database Initialization

Generate the Prisma client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

You can seed the database with test user credentials (`john@doe.com` / password `johndoe123`) and sample tracker data by running:

```bash
# Using Yarn
yarn prisma db seed

# Using NPM
npm run prisma db seed
```

### 5. Running the Application

Start the Next.js development server:

```bash
# Using Yarn
yarn dev

# Using NPM
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Folder Structure

```
├── app/                  # Next.js App Router (pages & API endpoints)
├── components/           # React Components (layout, widgets, UI elements)
├── hooks/                # Custom React Hooks
├── lib/                  # Helper utilities, configuration & client clients
├── prisma/               # Schema configuration and database models
├── public/               # Static assets (images, icons)
└── scripts/              # Database seeding scripts
```

---

## License

This project is private and proprietary.
