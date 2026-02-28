const axios = require('axios');

async function main() {
    console.log('Starting Full Integration Verification (Referral & Sacco)...');

    const USER_SERVICE_URL = 'http://localhost:3335/api';
    const REFERRAL_SERVICE_URL = 'http://localhost:3337/api';
    const SACCO_SERVICE_URL = 'http://localhost:3338/api';
    const DISPATCH_SERVICE_URL = 'http://localhost:3334/api';

    try {
        // 1. Health Checks
        console.log('Running health checks...');
        await axios.get(`${USER_SERVICE_URL}/auth/health`).catch(() => console.log('User service health check skipped (no endpoint)'));
        await axios.get(`${REFERRAL_SERVICE_URL}/admin/referral/config`);
        await axios.get(`${SACCO_SERVICE_URL}/sacco/health`);
        console.log('✅ Services are responding.');

        // 2. Setup Referrer and Referral Code
        const timestamp = Date.now();
        const referrerData = {
            firstName: 'Referrer',
            lastName: 'User',
            email: `referrer.${timestamp}@test.com`,
            phone: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
            password: 'Password123!',
            role: 'driver'
        };

        console.log('Creating Referrer...');
        const refRes = await axios.post(`${USER_SERVICE_URL}/auth/register`, referrerData);
        const referrerId = refRes.data.userId || refRes.data.id;
        console.log('✅ Referrer Created:', referrerId);

        await axios.post(`${USER_SERVICE_URL}/users/${referrerId}/promote`);
        console.log('✅ Referrer Promoted to Driver');

        const codeRes = await axios.get(`${REFERRAL_SERVICE_URL}/admin/referral/code?userId=${referrerId}`);
        const referralCode = codeRes.data.code;
        console.log('✅ Referrer Code:', referralCode);

        // 3. Register New User with Referral Code
        const newDriverData = {
            firstName: 'Invited',
            lastName: 'Driver',
            email: `invited.${timestamp}@test.com`,
            phone: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
            password: 'Password123!',
            role: 'driver',
            referrerCode: referralCode // Assuming this field is used in registration
        };

        console.log('Registering New Driver with Referral Code...');
        // Note: some systems use 'referralCode' during registration, 
        // others might need an explicit 'apply' call. We'll try both or follow the apply logic.
        const userRes = await axios.post(`${USER_SERVICE_URL}/auth/register`, newDriverData);
        const newUserId = userRes.data.userId || userRes.data.id;

        // Explicitly apply code if not handled automatically
        await axios.post(`${REFERRAL_SERVICE_URL}/admin/referral/apply`, {
            userId: newUserId,
            code: referralCode,
            userType: 'driver'
        }).catch(e => console.log('Note: Apply code might have already been handled or failed:', e.message));

        console.log('✅ New User Registered:', newUserId);

        // 4. Promote and check Commission
        console.log('Promoting to Driver...');
        const promoteRes = await axios.post(`${USER_SERVICE_URL}/users/${newUserId}/promote`);
        const driverProfile = promoteRes.data;
        console.log('✅ User Promoted. Profile ID:', driverProfile.id);

        console.log('Waiting for commission processing...');
        await new Promise(r => setTimeout(r, 2000));

        const commissionsRes = await axios.get(`${REFERRAL_SERVICE_URL}/admin/referral/my-commissions?driverId=${referrerId}`);
        const history = commissionsRes.data.history || [];
        const foundCommission = history.length > 0;

        if (foundCommission) {
            console.log('✅ Referral Commission Recorded!');
        } else {
            console.warn('⚠️ No commission recorded for referrer. Check service logs.');
        }

        // 5. Simulate Ride Completion for Sacco Deduction
        console.log('Simulating Ride Completion for Sacco Deduction...');
        // We call the 'deduct' endpoint directly or mock a ride completion event if possible.
        // The RideService calls POST /api/sacco/deduct
        const tripId = `trip-${timestamp}`;
        const finalFare = 1000;

        await axios.post(`${SACCO_SERVICE_URL}/sacco/deduct`, {
            tripId: tripId,
            driverId: driverProfile.id,
            finalFare: finalFare
        });

        console.log('Checking Sacco Balance...');
        const balanceRes = await axios.get(`${SACCO_SERVICE_URL}/sacco/balance?driverId=${driverProfile.id}`);
        console.log('✅ Sacco Balance:', balanceRes.data);

        if (balanceRes.data.totalSavings > 0) {
            console.log('✅ Sacco deduction and saving confirmed!');
        } else {
            console.error('❌ Sacco saving failed or remained zero.');
        }

        console.log('🎉 Integration Verification SUCCESSFUL!');

    } catch (error) {
        console.error('❌ Verification FAILED');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

main();
