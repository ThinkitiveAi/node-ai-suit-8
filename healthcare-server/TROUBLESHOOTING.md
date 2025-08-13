# 🔧 Application Troubleshooting Guide

## Quick Fix Script

I've created a `fix-and-start.js` script that should resolve most issues:

```bash
node fix-and-start.js
```

## Manual Steps (if script fails)

### Step 1: Fix Database Schema
The main issue is that we changed from UUID to integer IDs. Run these commands:

```bash
# Generate new Prisma client
npx prisma generate

# Apply new schema (this will reset your database)
npx prisma db push --force-reset --accept-data-loss

# Seed with demo data
npm run prisma:seed
```

### Step 2: Check TypeScript Compilation
```bash
# Try to build
npm run build

# If there are TypeScript errors, they should be mostly fixed now
# Look for any remaining "Type 'string' is not assignable to type 'number'" errors
```

### Step 3: Start Application
```bash
# Kill any existing processes
pkill -f node

# Start the application
npm run start:dev
```

## Common Issues & Solutions

### Issue 1: "EADDRINUSE: address already in use 0.0.0.0:3000"
```bash
# Find and kill the process using port 3000
lsof -t -i :3000 | xargs kill -9

# Or kill all node processes
pkill -f node

# Then restart
npm run start:dev
```

### Issue 2: "Migration failed" or "Prisma errors"
```bash
# Complete reset
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Reset database completely
npx prisma migrate reset --force
npx prisma db push --accept-data-loss
npx prisma generate
npm run prisma:seed
```

### Issue 3: "Module not found" errors
```bash
# Install missing dependencies
npm install --legacy-peer-deps

# Specific packages that might be missing:
npm install axios pg dotenv --legacy-peer-deps
```

### Issue 4: TypeScript compilation errors
The main fixes I've applied:
- ✅ Updated DTOs to use `number` instead of `string` for IDs
- ✅ Updated services to convert string IDs to integers with `parseInt(id, 10)`
- ✅ Fixed JWT strategy to handle integer user IDs
- ✅ Updated availability services for new ID structure

### Issue 5: Database connection issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql

# Verify your .env file contains:
DATABASE_URL="postgresql://postgres:root@localhost:5432/ttpl?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key-change-this-in-production"
PORT=3000
NODE_ENV="development"
```

## Verification Steps

Once the application starts, test these endpoints:

```bash
# Check health
curl http://localhost:3000/health

# Check API docs
curl http://localhost:3000/api/docs

# Register a patient (should return integer ID)
curl -X POST http://localhost:3000/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "password": "SecurePass123!",
    "dateOfBirth": "1990-01-01",
    "gender": "Male"
  }'
```

The response should now show integer IDs like:
```json
{
  "user": {
    "id": 1,          // Integer ID (new)
    "uuid": "...",    // UUID (separate field)
    "email": "john.doe@example.com",
    ...
  }
}
```

## Database Schema Verification

You can verify the new schema with:
```bash
# Connect to database
psql -U postgres -h localhost -p 5432 -d ttpl

# Check table structure
\d patients
\d providers
\d provider_availability

# Should show:
# - id column as integer PRIMARY KEY
# - uuid column as separate UUID field
```

## If All Else Fails

1. **Complete Clean Restart:**
```bash
# Stop everything
pkill -f node
pkill -f nest

# Clean install
rm -rf node_modules package-lock.json dist
npm install --legacy-peer-deps

# Reset database
dropdb ttpl -U postgres -h localhost
createdb ttpl -U postgres -h localhost

# Apply schema fresh
npx prisma db push --accept-data-loss
npx prisma generate
npm run prisma:seed

# Start fresh
npm run start:dev
```

2. **Check logs for specific errors:**
   - Look for Prisma client generation errors
   - Check for missing environment variables
   - Verify database connection strings

3. **Fallback to production mode:**
```bash
npm run build
npm run start:prod
```

## Success Indicators

✅ Application starts without TypeScript errors  
✅ Database connection successful  
✅ Prisma client generated with integer ID types  
✅ API endpoints respond correctly  
✅ New registrations return integer IDs with separate UUIDs  
✅ JWT authentication works with integer user IDs  

## Need Help?

If you're still having issues, please share:
1. The exact error message
2. Output of `npm run build`
3. Contents of your `.env` file (hide sensitive values)
4. Database connection status: `sudo systemctl status postgresql` 