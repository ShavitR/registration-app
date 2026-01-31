#!/bin/sh

# Function to wait for the database
wait_for_db() {
  echo "Waiting for SQL Server to be ready at db:1433..."
  # Try to connect to the DB port
  while ! nc -z db 1433; do
    sleep 1
  done
  echo "SQL Server is up!"
}

# Wait for DB
wait_for_db

# Run Prisma migrations/push
echo "Synchronizing database schema..."
# We use --accept-data-loss for the "clean state" ease of use in dev
npx prisma db push --accept-data-loss

echo "Database is synchronized!"

# Start the application
echo "Starting Next.js application..."
exec node server.js
