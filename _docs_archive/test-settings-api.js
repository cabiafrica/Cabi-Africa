const axios = require('axios');

async function testSettings() {
    const baseUrl = 'http://localhost:3334/api'; // Dispatch service port

    // 1. Check Swagger docs
    try {
        const docs = await axios.get('http://localhost:3334/api/docs');
        console.log('Swagger Docs:', docs.status === 200 ? 'OK' : 'FAIL');
    } catch (error) {
        console.error('Swagger Docs FAIL:', error.message);
    }

    // 2. Test User Settings
    try {
        // Real user ID from DB
        const userId = 'f60d7685-3bf5-48b0-bacd-9b1f8f921588';
        const updatePayload = {
            fullName: 'Test User',
            city: 'Nairobi',
            privacySettings: {
                showEmail: true
            }
        };

        const updateRes = await axios.put(`${baseUrl}/settings/user/${userId}`, updatePayload);
        console.log('Update User Settings:', updateRes.status === 200 ? 'OK' : 'FAIL', updateRes.data);

        // Get user settings
        const getRes = await axios.get(`${baseUrl}/settings/user/${userId}`);
        console.log('Get User Settings:', getRes.status === 200 ? 'OK' : 'FAIL');
        console.log('Retrieved Data:', getRes.data);

        if (getRes.data.fullName === 'Test User' && getRes.data.privacySettings && getRes.data.privacySettings.showEmail === true) {
            console.log('User Settings Persistence: SUCCESS');
        } else {
            console.log('User Settings Persistence: FAIL - Data mismatch');
        }

    } catch (error) {
        console.error('User Settings Test FAIL:', error.response ? error.response.data : error.message);
    }

    // 3. Test Driver Savings Preferences
    try {
        // Real driver profile ID from DB
        const driverId = '9830b244-4a76-4414-a21a-7617b2f01461';
        const savingsPayload = {
            personalSavingRate: 15,
            isAutoSavingsEnabled: true
        };

        const updateRes = await axios.put(`${baseUrl}/settings/driver-savings/${driverId}`, savingsPayload);
        console.log('Update Driver Savings:', updateRes.status === 200 ? 'OK' : 'FAIL', updateRes.data);

        const getRes = await axios.get(`${baseUrl}/settings/driver-savings/${driverId}`);
        console.log('Get Driver Savings:', getRes.status === 200 ? 'OK' : 'FAIL');

        if (getRes.data.personalSavingRate === 15 && getRes.data.isAutoSavingsEnabled === true) {
            console.log('Driver Savings Persistence: SUCCESS');
        } else {
            console.log('Driver Savings Persistence: FAIL - Data mismatch');
        }

    } catch (error) {
        console.error('Driver Savings Test FAIL:', error.response ? error.response.data : error.message);
    }
}

testSettings();
