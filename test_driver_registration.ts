import axios from 'axios';

const API_URL = 'http://localhost:3010/api/v1';

async function testDriverRegistration() {
    console.log('='.repeat(60));
    console.log('DRIVER REGISTRATION API TEST');
    console.log('='.repeat(60));

    const timestamp = Date.now();
    const testData = {
        firstName: 'Test',
        lastName: 'Driver',
        email: `test_driver_${timestamp}@test.com`,
        phone: `+254722${timestamp.toString().slice(-6)}`,
        dateOfBirth: '1990-01-01',
        street: '123 Test Street',
        city: 'Nairobi',
        county: 'Nairobi',
        vehicleType: 'car',
        vehicleMake: 'Toyota',
        vehicleModel: 'Corolla',
        vehicleYear: 2020,
        licensePlate: `KDA ${Math.floor(100 + Math.random() * 900)}X`,
        nationalId: `ID-${timestamp}`,
        drivingLicense: `DL-${timestamp}`,
        password: 'Password123!',
        recaptchaToken: 'SIMULATED',
        referralCode: '',
        agreeToTerms: true
    };

    console.log('\n📝 Test Data:');
    console.log(JSON.stringify(testData, null, 2));

    try {
        console.log('\n🚀 Sending registration request...');
        const response = await axios.post(`${API_URL}/driver-leads/register`, testData);

        console.log('\n✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        return { success: true, data: response.data };
    } catch (error) {
        console.log('\n❌ FAILED!');

        if (axios.isAxiosError(error)) {
            console.log('Status:', error.response?.status);
            console.log('Error Response:', JSON.stringify(error.response?.data, null, 2));
            console.log('Error Message:', error.message);

            if (error.code === 'ECONNREFUSED') {
                console.log('\n⚠️  Backend service is not running!');
                console.log('Please start the backend with: .\\launch_backend.ps1');
            }
        } else {
            console.log('Unexpected Error:', error);
        }

        return { success: false, error };
    }
}

// Run the test
testDriverRegistration().then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETED');
    console.log('='.repeat(60));
    process.exit(result.success ? 0 : 1);
});
