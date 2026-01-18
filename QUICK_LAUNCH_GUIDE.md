# 🚀 Quick Launch Preparation Guide

**Last Updated:** January 18, 2026

---

## ⚡ Quick Start

### One-Command Launch Preparation

```bash
npm run launch:prepare
```

This will clean all test data and leave only the Super Admin user.

---

## 📋 Available Commands

### Launch Preparation Commands

```bash
# Prepare for launch (clean all data, keep only Super Admin)
npm run launch:prepare

# List all users in database
npm run launch:list-users

# Alternative: with custom password
node scripts/prepare-for-launch.js YourPassword123!
```

### Admin User Management

```bash
# Recreate Super Admin (default password)
npm run admin:recreate

# Recreate Super Admin (custom password)
node scripts/recreate-super-admin.js YourPassword123!

# Verify Super Admin setup
npm run admin:verify
```

### Database Management

```bash
# Clean all data (keep users)
npm run db:clean

# Seed RBAC roles
npm run db:seed-roles
```

---

## 🔐 Default Super Admin Credentials

After running `npm run launch:prepare`:

```
Email:    ithrivebusinessnetworks@gmail.com
Password: Admin@2026
Username: superadmin
```

**⚠️ IMPORTANT:** Change the password immediately after first login!

---

## ✅ Pre-Launch Checklist

- [ ] Database is accessible
- [ ] All services are running
- [ ] Backup created
- [ ] Environment variables configured
- [ ] Ready to clean test data

---

## 🎯 Launch Preparation Steps

### Step 1: Check Current State
```bash
npm run launch:list-users
```

### Step 2: Backup Database
```bash
# Create backup before proceeding
# Use your database backup method
```

### Step 3: Prepare for Launch
```bash
npm run launch:prepare
```

### Step 4: Verify Results
```bash
npm run launch:list-users
```

**Expected Output:**
- Total Users: 1
- Email: ithrivebusinessnetworks@gmail.com
- Role: SUPER_ADMIN
- Permissions: 102

### Step 5: Test Login
1. Open Admin Panel: http://localhost:5173
2. Login with Super Admin credentials
3. Change password immediately
4. Verify all features work

---

## 🔄 What Gets Cleaned

### ❌ Removed
- All test users
- All rides and bookings
- All occurrences
- All driver profiles
- All vehicles
- All organizations
- All verification records

### ✅ Preserved
- RBAC roles and permissions
- System configuration
- Database schema
- Super Admin user (recreated)

---

## 🛠️ Troubleshooting

### Database Connection Error

**Error:** "Can't reach database server"

**Fix:**
1. Check internet connection
2. Verify `.env` file has correct DATABASE_URL
3. Ensure Supabase instance is running
4. Try direct connection URL

### Script Fails

**Fix:**
1. Read the error message
2. Run the script again (it's idempotent)
3. Check database connectivity
4. Verify Prisma schema is up to date

### Can't Login After Preparation

**Fix:**
```bash
# Recreate Super Admin
npm run admin:recreate

# Verify setup
npm run admin:verify
```

---

## 📊 Success Indicators

After successful launch preparation:

✅ Script completes without errors  
✅ Only 1 user in database  
✅ 0 rides in database  
✅ 0 occurrences in database  
✅ Super Admin can login  
✅ All permissions active  
✅ All services running  

---

## 📞 Need Help?

1. **Check Documentation:**
   - `LAUNCH_PREPARATION_SUMMARY.md` - Detailed guide
   - `LAUNCH_CHECKLIST.md` - Complete checklist
   - `ADMIN_LOGIN_REFERENCE.md` - Login info

2. **Run Diagnostics:**
   ```bash
   npm run admin:verify
   npm run launch:list-users
   ```

3. **Review Logs:**
   - Check auth-gateway logs
   - Check dispatch-service logs
   - Review browser console

---

## 🎉 After Launch

### Immediate Actions
1. Login to Admin Panel
2. Change Super Admin password
3. Create additional admin users (if needed)
4. Set up organization structure
5. Configure system settings

### Within 24 Hours
1. Test all user flows
2. Verify email notifications
3. Test payment processing
4. Monitor error logs
5. Review performance metrics

---

## 🔒 Security Reminders

- ✅ Change default password immediately
- ✅ Use strong, unique passwords
- ✅ Enable 2FA if available
- ✅ Rotate JWT secrets for production
- ✅ Use HTTPS only
- ✅ Monitor for suspicious activity

---

**Ready to Launch?** Run: `npm run launch:prepare`
