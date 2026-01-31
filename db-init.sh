#!/bin/sh
set -e # Exit immediately if a command fails

echo "🔍 Starting Database Initialization..."

# Function to wait for the database
wait_for_db() {
  echo "🔍 Waiting for SQL Server to be ready at db:1433..."
  MAX_TRIES=30
  COUNT=0
  while ! nc -z db 1433; do
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_TRIES ]; then
      echo "❌ Error: SQL Server did not become ready in time."
      exit 1
    fi
    echo "⏳ SQL Server not ready yet ($COUNT/$MAX_TRIES)... sleeping"
    sleep 2
  done
  echo "✅ SQL Server port is open! Waiting 5 more seconds for engine to initialize..."
  sleep 5
}

# Wait for DB
wait_for_db

# Create database if it doesn't exist
echo "🔨 Ensuring database 'histadrut' exists..."
./node_modules/.bin/prisma db execute --url "sqlserver://db:1433;user=sa;password=Ply!PlusUser2026;database=master;encrypt=true;trustServerCertificate=true" --stdin <<EOF
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'histadrut')
BEGIN
  CREATE DATABASE histadrut;
  PRINT 'Database "histadrut" created.';
END
ELSE
BEGIN
  PRINT 'Database "histadrut" already exists.';
END
EOF

# Run Prisma schema push
echo "🚀 Synchronizing database schema..."
./node_modules/.bin/prisma db push --accept-data-loss

echo "🎉 Database synchronization complete! Initialization container exiting."
exit 0
