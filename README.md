# 📋 Registration Management System

A premium, full-stack registration management system built with **Next.js 15**, **Prisma**, and **Microsoft SQL Server**.

---

### 🐋 Option A: Docker (Automatic)
The app and database are fully containerized.

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/ShavitR/registration-app.git
   cd registration-app
   ```
2. **Run**:
   ```bash
   docker-compose up --build
   ```
   *The app will automatically wait for the database, sync the schema, and go live at [http://localhost:3000](http://localhost:3000)*

---

### 💻 Option B: Local Development (One Command)
If you have MS SQL Server running locally:

1. **Clone & Env**:
   - Clone the repo.
   - Copy `.env.example` to `.env` and update your `DATABASE_URL`.
2. **One-Command Setup**:
   ```bash
   npm run setup
   ```
   *This single command installs dependencies, creates tables, and starts the development server.*

---

## ✨ Key Features

- **📊 Advanced Analytics**: Real-time charts for registration trends, gender distribution, and membership types.
- **🔍 Smart Search**: "Search by" functionality in both the member database and validation error tables.
- **🇮🇱 Full RTL Support**: Beautifully crafted Hebrew interface with premium dark-glass aesthetics.
- **🛠️ Validation Engine**: Integrated rules for verifying Excel uploads before they hit the database.
- **🐳 Docker Ready**: Full containerization for easy deployment.

---

## 📁 Project Structure

- `/app`: Next.js App Router (Pages & APIs).
- `/components`: Reusable UI components (shadcn/ui + custom).
- `/lib`: Helper functions, validation logic, and database client.
- `/prisma`: Database schema and migrations.
- `/public`: Static assets.

---

## 🛠️ Built With

- **Framework**: Next.js 15
- **Database**: MS SQL Server (via Prisma)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
