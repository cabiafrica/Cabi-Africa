const axios = require('axios');
const { randomBytes } = require('crypto');

const BASE_URL = process.env.API_URL || 'http://localhost:3333/api';

async function testProfilePictureLifecycle() {
    console.log('🚀 [Lifecycle Test] Starting User Profile Picture Lifecycle Verification...');
    console.log(`🌐 Base URL: ${BASE_URL}`);

    const randomNum = () => Math.floor(100000 + Math.random() * 900000).toString();
    const randomStr = () => randomBytes(4).toString('hex');
    const password = 'Password123!';

    // Dummy base64 1x1 png for testing
    const sampleBase64Avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const sampleCloudinaryUrl = 'https://res.cloudinary.com/cabi-africa/image/upload/v1/profiles/driver_avatar.jpg';
    const newAvatarUrl = 'https://res.cloudinary.com/cabi-africa/image/upload/v2/drivers/kofi_official.jpg';

    let failures = 0;

    function assert(condition, message) {
        if (!condition) {
            console.error(`❌ ASSERTION FAILED: ${message}`);
            failures++;
        } else {
            console.log(`✅ ${message}`);
        }
    }

    try {
        // ==========================================
        // 1. PASSENGER FLOW
        // ==========================================
        const passEmail = `passenger_pp_${randomStr()}@test.com`;
        console.log(`\n========================================`);
        console.log(`👤 1. REGISTER & LOGIN PASSENGER: ${passEmail}`);
        console.log(`========================================`);

        const passRegRes = await axios.post(`${BASE_URL}/auth/register`, {
            email: passEmail,
            password,
            role: 'passenger',
            firstName: 'Elena',
            lastName: 'Nairobi',
            phone: `+254700${randomNum()}`
        });

        const passengerId = passRegRes.data.userId || passRegRes.data.id || (passRegRes.data.user && passRegRes.data.user.id);
        assert(passengerId, `Passenger successfully registered with ID: ${passengerId}`);

        const passLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: passEmail,
            password
        });
        const passToken = passLoginRes.data.token || passLoginRes.data.accessToken;
        assert(passToken, 'Passenger logged in and received JWT');

        // Verify initial getMe
        const passMeBefore = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${passToken}` }
        });
        console.log(`ℹ️ Passenger passportPhotoUrl before update: ${passMeBefore.data.passportPhotoUrl || 'null'}`);

        // Update Passenger Profile via PUT /api/auth/profile
        console.log(`\n📸 Updating Passenger profile picture via PUT /api/auth/profile...`);
        const updatePassRes = await axios.put(`${BASE_URL}/auth/profile`, {
            fullName: 'Elena Nairobi Updated',
            profilePicture: sampleBase64Avatar,
            phoneNumber: `+254700${randomNum()}`
        }, {
            headers: { Authorization: `Bearer ${passToken}` }
        });

        assert(updatePassRes.status === 200, `PUT /api/auth/profile returned status ${updatePassRes.status}`);
        assert(
            updatePassRes.data.passportPhotoUrl === sampleBase64Avatar || updatePassRes.data.profilePicture === sampleBase64Avatar,
            'Profile picture properly saved in response payload'
        );

        // Verify with GET /api/auth/me
        console.log(`\n🔍 Verifying Passenger GET /api/auth/me...`);
        const passMeAfter = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${passToken}` }
        });

        assert(
            passMeAfter.data.passportPhotoUrl === sampleBase64Avatar,
            'passportPhotoUrl matches sampleBase64Avatar on /api/auth/me'
        );
        assert(
            passMeAfter.data.profilePicture === sampleBase64Avatar,
            'profilePicture alias matches sampleBase64Avatar on /api/auth/me'
        );
        assert(
            passMeAfter.data.fullName?.includes('Elena Nairobi Updated'),
            'Passenger fullName successfully updated'
        );

        // ==========================================
        // 2. DRIVER FLOW
        // ==========================================
        console.log(`\n========================================`);
        console.log(`🚗 2. LOGIN DRIVER: driver@test.com`);
        console.log(`========================================`);

        let driverToken;
        let driverId;

        try {
            const driverLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'driver@test.com',
                password: 'Password@2026'
            });
            driverToken = driverLoginRes.data.token || driverLoginRes.data.accessToken;
            driverId = driverLoginRes.data.user?.id;
            assert(driverToken, 'Existing test driver logged in and received JWT');
        } catch (loginErr) {
            console.log('Driver login with standard seed failed, attempting dynamic driver creation...');
            const driverEmail = `driver_pp_${randomStr()}@test.com`;
            const passReg = await axios.post(`${BASE_URL}/auth/register`, {
                email: driverEmail,
                password,
                role: 'driver',
                firstName: 'Kofi',
                lastName: 'Driver',
                phone: `+254711${randomNum()}`
            });
            driverId = passReg.data.userId || passReg.data.id;
            const logRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: driverEmail,
                password
            });
            driverToken = logRes.data.token || logRes.data.accessToken;
            assert(driverToken, `Dynamic driver (${driverEmail}) logged in and received JWT`);
        }

        // Test POST /api/auth/profile-picture endpoint
        console.log(`\n📸 Uploading Driver profile picture via POST /api/auth/profile-picture...`);
        const driverUploadRes = await axios.post(`${BASE_URL}/auth/profile-picture`, {
            profilePicture: sampleCloudinaryUrl
        }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });

        assert(driverUploadRes.status === 201 || driverUploadRes.status === 200, 'POST /api/auth/profile-picture returned 200/201');
        assert(
            driverUploadRes.data.passportPhotoUrl === sampleCloudinaryUrl || driverUploadRes.data.profilePicture === sampleCloudinaryUrl,
            'Driver profile picture matches sampleCloudinaryUrl'
        );

        // Verify with GET /api/auth/me
        const driverMeAfterUpload = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        assert(
            driverMeAfterUpload.data.passportPhotoUrl === sampleCloudinaryUrl,
            'Driver GET /api/auth/me reflects sampleCloudinaryUrl'
        );

        // Test GET /api/users/:id/profile & PUT /api/users/:id/profile
        console.log(`\n🛠️ Testing Direct User Profile API: /api/users/${driverId}/profile...`);
        const userProfileGet = await axios.get(`${BASE_URL}/users/${driverId}/profile`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        assert(userProfileGet.data.id === driverId, 'Retrieved user profile by ID');

        const userProfilePut = await axios.put(`${BASE_URL}/users/${driverId}/profile`, {
            passportPhotoUrl: newAvatarUrl
        }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        assert(
            userProfilePut.data.passportPhotoUrl === newAvatarUrl,
            'Direct PUT /api/users/:id/profile persisted new photo URL'
        );

        // Verify final driver /auth/me
        console.log(`\n🔍 Verifying Driver final GET /api/auth/me...`);
        const driverMeFinal = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        assert(
            driverMeFinal.data.passportPhotoUrl === newAvatarUrl,
            'Driver GET /api/auth/me has correct passportPhotoUrl'
        );
        assert(
            driverMeFinal.data.profilePicture === newAvatarUrl,
            'Driver GET /api/auth/me has correct profilePicture alias'
        );

        // Test PATCH /api/auth/profile
        console.log(`\n🔁 Testing PATCH /api/auth/profile with base64 data URI...`);
        const patchRes = await axios.patch(`${BASE_URL}/auth/profile`, {
            profilePicture: sampleBase64Avatar
        }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });
        assert(patchRes.status === 200, 'PATCH /api/auth/profile returned 200');
        assert(
            patchRes.data.passportPhotoUrl === sampleBase64Avatar,
            'Driver passportPhotoUrl updated via PATCH'
        );

        console.log(`\n=============================================================`);
        if (failures === 0) {
            console.log('🎉 ALL PROFILE PICTURE LIFECYCLE TESTS PASSED PERFECTLY! 100% SUCCESS!');
        } else {
            console.error(`💥 COMPLETED WITH ${failures} FAILED ASSERTIONS.`);
            process.exit(1);
        }
        console.log(`=============================================================\n`);

    } catch (err) {
        console.error('❌ Test failed with error:', err.response?.data || err.message);
        process.exit(1);
    }
}

testProfilePictureLifecycle();
