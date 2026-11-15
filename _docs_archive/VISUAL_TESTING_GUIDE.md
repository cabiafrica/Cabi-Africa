# 🧪 Admin Panel Integration - Visual Testing Guide

## Quick Start Testing Instructions

### Step 1: Verify Services Are Running

**Check Backend Service:**
```bash
# Should see: "🚀 Application is running on: http://localhost:3333/api"
# If not running, start it with:
cd "d:\IBN\PROJECTS\Cabi Africa"
node dist/auth-gateway/main.js
```

**Check Admin Panel:**
```bash
# Should see: "VITE ready in XXXXms"
# If not running, start it with:
cd "d:\IBN\PROJECTS\Cabi Africa\web\admin_panel"
npm run dev
```

---

### Step 2: Test Login Flow

1. **Open Browser:** Navigate to `http://localhost:3001/login`

2. **Expected Login Page:**
   - Dark themed login form
   - Cabi Africa logo in a circle
   - "ADMIN PANEL" text
   - Username and Password fields
   - "Remember me" checkbox
   - "Forgot Password?" link
   - "LOGIN" button

3. **Enter Credentials:**
   ```
   Email/Username: ke.africabi@gmail.com
   Password: Admin@2026
   ```

4. **Click "LOGIN"**

5. **Expected Result:**
   - Brief loading spinner
   - Redirect to `/dashboard`
   - Sidebar appears with menu items
   - User profile shows at top of sidebar
   - No console errors (press F12 to check)

**✅ Success Indicators:**
- URL changes to `http://localhost:3001/dashboard`
- You see "Admin Dashboard" heading
- Sidebar shows "CABI ADMIN" branding
- Profile section shows "Super Admin" or your name

**❌ Failure Indicators:**
- "Invalid credentials" error → Check password
- Network error → Backend not running
- Console errors → Check browser console (F12)

---

### Step 3: Navigate to Job Activities

1. **Locate Sidebar Menu**
   - Look for "Operations" section (should be expanded by default)
   - Find "🚗 Job Activities" menu item

2. **Click "Job Activities"**

3. **Expected Result:**
   - URL changes to `http://localhost:3001/job-activities`
   - Page loads with "Job Activities" heading
   - Statistics cards at top showing:
     - Total Rides
     - Active Rides
     - Completed
     - Total Revenue
   - Filter section with Search, Status, and Date inputs
   - Table with ride data

---

### Step 4: Verify Real Data Display

**What You Should See in the Table:**

The table should display rides created during the E2E test. Look for:

**Table Columns:**
1. **Ride ID** - Short UUID (e.g., `eb96f9ff...`)
2. **Passenger** - Name and phone number
3. **Driver** - Name and phone (or "Not assigned")
4. **Status** - Colored chip (e.g., "COMPLETED" in green)
5. **Pickup** - Address (e.g., "Nairobi CBD")
6. **Dropoff** - Address (e.g., "Westlands")
7. **Fare** - Amount (e.g., "KES 0" or actual fare)
8. **Distance** - Kilometers or "N/A"
9. **Time** - Timestamp
10. **Actions** - Eye icon for details

**Sample Expected Data:**
```
Ride ID: b459d39d...
Passenger: Test Passenger (+254700603272)
Driver: Test Driver (+254711603272)
Status: COMPLETED (green chip)
Pickup: Nairobi CBD
Dropoff: Westlands
Fare: KES 0 (or calculated fare)
Distance: N/A
Time: 17/01/2026, 12:53:18
```

**✅ Success Indicators:**
- Table shows at least 3-5 rides (from E2E tests)
- Passenger names are "Test Passenger"
- Driver names are "Test Driver"
- All statuses show "COMPLETED"
- Pickup shows "Nairobi CBD"
- Dropoff shows "Westlands"
- Timestamps are recent (today's date)

**❌ Failure Indicators:**
- "No rides found" message → API not returning data
- "Loading..." stuck → Network issue
- Mock data (random names) → API call failed, using fallback
- Console errors → Check browser console

---

### Step 5: Test Ride Details

1. **Click the eye icon** (👁️) in the Actions column for any ride

2. **Expected Result:**
   - Modal/dialog opens
   - Shows "Ride Details" heading
   - Status chip displayed
   - Three tabs: Overview, Location, Timeline

3. **Overview Tab Should Show:**
   - Ride ID (full UUID)
   - Status
   - Passenger name and phone
   - Driver name and phone
   - Fare amount
   - Distance
   - Duration

4. **Location Tab Should Show:**
   - Pickup location with coordinates
   - Dropoff location with coordinates
   - Map placeholder (says "Map integration coming soon")

5. **Timeline Tab Should Show:**
   - Created At timestamp
   - Last Updated timestamp

**✅ Success Indicators:**
- All data matches the table row
- Passenger/Driver details are complete
- Coordinates are visible (e.g., -1.292100, 36.821900)

---

### Step 6: Test Filters

**Status Filter:**
1. Click the "Status" dropdown
2. Select "COMPLETED"
3. Table should show only completed rides

**Search Filter:**
1. Type "Test Passenger" in search box
2. Table should filter to matching rides

**Date Filter:**
1. Click the date picker
2. Select today's date
3. Table should show only today's rides

**✅ Success Indicators:**
- Filters work correctly
- Result count updates
- Table refreshes without errors

---

## 🔍 Troubleshooting Guide

### Issue: Login Fails with "Invalid Credentials"

**Possible Causes:**
1. Wrong password
2. Super admin not created
3. Backend not running

**Solutions:**
```bash
# Recreate super admin
cd "d:\IBN\PROJECTS\Cabi Africa"
node scripts/recreate-super-admin.js Admin@2026

# Verify backend is running
# Should see output on http://localhost:3333/api
```

---

### Issue: "No Rides Found" in Job Activities

**Possible Causes:**
1. E2E test not run
2. Database empty
3. API endpoint not working

**Solutions:**
```bash
# Run E2E test to create sample rides
cd "d:\IBN\PROJECTS\Cabi Africa"
npx ts-node e2e_ride_test.spec.ts

# Test API directly
# Open browser to: http://localhost:3333/api/rides
# Should return JSON array of rides
```

---

### Issue: Mock Data Displayed Instead of Real Data

**Symptoms:**
- Random passenger names (John Doe, Jane Smith, etc.)
- Random phone numbers
- Many different statuses

**Cause:** API call failed, component using fallback mock data

**Check:**
1. Open browser console (F12)
2. Look for network errors
3. Check "Network" tab for failed `/api/rides` request

**Solutions:**
- Verify backend is running
- Check Vite proxy configuration
- Verify auth token is present in localStorage

---

### Issue: Console Errors

**Common Errors:**

**"Failed to fetch"**
- Backend not running
- CORS issue (should be handled by proxy)
- Wrong API URL

**"401 Unauthorized"**
- Token expired or invalid
- Re-login required

**"Cannot read property 'fullName' of undefined"**
- Data structure mismatch
- Check backend response format

---

## 🎯 Expected vs Actual Checklist

Use this checklist to verify everything works:

### Authentication
- [ ] Login page loads without errors
- [ ] Login with correct credentials succeeds
- [ ] Redirects to dashboard after login
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Sidebar shows user profile

### Job Activities Page
- [ ] Page loads without errors
- [ ] Statistics cards show numbers
- [ ] Table displays ride data
- [ ] At least 3-5 rides visible
- [ ] Passenger names are "Test Passenger"
- [ ] Driver names are "Test Driver"
- [ ] All rides show "COMPLETED" status
- [ ] Pickup/Dropoff addresses visible
- [ ] Timestamps are recent

### Ride Details
- [ ] Click eye icon opens modal
- [ ] Modal shows complete ride data
- [ ] All three tabs work
- [ ] Data matches table row
- [ ] Close button works

### Filters
- [ ] Status filter works
- [ ] Search filter works
- [ ] Date filter works
- [ ] Result count updates

### Browser Console
- [ ] No red errors in console
- [ ] No failed network requests
- [ ] API calls return 200 status

---

## 📸 Screenshot Checklist

Take screenshots of the following for documentation:

1. **Login Page** - Before login
2. **Dashboard** - After successful login
3. **Job Activities** - Full page view
4. **Rides Table** - Showing real data
5. **Ride Details Modal** - All three tabs
6. **Browser Console** - Network tab showing successful API calls
7. **localStorage** - Showing authToken and authUser

---

## 🚀 Next Steps After Verification

Once you confirm everything works:

1. **Document Results**
   - Take screenshots
   - Note any issues
   - Record performance metrics

2. **Update Status**
   - Mark Phase 5 as complete
   - Update task_status.md
   - Create final report

3. **Optional Enhancements**
   - Add real-time updates
   - Implement pagination
   - Add map visualization
   - Connect other admin features

---

## 📞 Quick Reference

**Services:**
- Backend: `http://localhost:3333/api`
- Admin Panel: `http://localhost:3001`

**Credentials:**
- Email: `ke.africabi@gmail.com`
- Password: `Admin@2026`

**Test Data:**
- Created by: `e2e_ride_test.spec.ts`
- Passenger: "Test Passenger"
- Driver: "Test Driver"
- Route: Nairobi CBD → Westlands

**Key Files:**
- Backend Controller: `libs/backend/dispatch-service/src/dispatch-service.controller.ts`
- Backend Service: `libs/backend/dispatch-service/src/dispatch-service.service.ts`
- Frontend Component: `web/admin_panel/src/components/operations/JobActivitiesDashboard.tsx`
- Auth Service: `web/admin_panel/src/pages/api/authService.ts`

---

**Last Updated:** 2026-01-17 13:13 EAT
**Status:** Ready for Manual Testing ✅
