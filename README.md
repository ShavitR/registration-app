# 📋 Registration Management System

A premium, full-stack registration management system built with **Next.js 15**, **Prisma**, and **Microsoft SQL Server**. This application features a stunning RTL (Hebrew) interface with real-time analytics, advanced search capabilities, and robust data validation.

---

## 🚀 Quick Start (Easiest Way)

The fastest way to get the app running is using **Docker Compose**. This will set up both the web application and the Microsoft SQL Server database automatically.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShavitR/registration-app.git
   cd registration-app
   ```

2. **Run with Docker**:
   ```bash
   docker-compose up --build
   ```

3. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💻 Local Development Setup

If you prefer to run the app locally without Docker, follow these steps:

### 1. Prerequisites
- **Node.js 20+**
- **npm** or **yarn**
- **MS SQL Server** instance running locally or remotely.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```
# Database connection string
DATABASE_URL="sqlserver://localhost:1433;database=histadrut;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true;"

# Authentication (Next-Auth)
AUTH_SECRET="your-random-generated-secret"
AUTH_URL="http://localhost:3000"
```

### 4. Database Setup
Push the Prisma schema to your database to create the necessary tables:

```bash
npx prisma db push
```

### 5. Run the App
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

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
