#!/bin/sh
set -e # Exit immediately if a command fails

# Function to wait for the database
wait_for_db() {
  echo "Waiting for SQL Server to be ready at db:1433..."
  while ! nc -z db 1433; do
    sleep 1
  done
  echo "SQL Server is up!"
}

# Wait for DB
wait_for_db

# Create database if it doesn't exist
echo "Ensuring database 'histadrut' exists..."
npx prisma db execute --url "sqlserver://db:1433;user=sa;password=Ply!PlusUser2026;database=master;encrypt=true;trustServerCertificate=true" --stdin <<EOF
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'histadrut')
BEGIN
  CREATE DATABASE histadrut;
END
EOF

# Run Prisma schema push
echo "Synchronizing database schema..."
# We use --accept-data-loss for the "clean state" ease of use in dev
npx prisma db push --accept-data-loss

echo "Database synchronization complete!"

# Start the application
echo "Starting Next.js application..."
exec node server.js
