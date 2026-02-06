
import axios from 'axios';

const API_URL = 'http://localhost:3010/api/v1'; // hitting driver-lead-service directly

async function registerDriver() {
    try {
        const timestamp = Date.now();
        const driverEmail = `pending_driver_${timestamp}@test.com`;
        console.log(`Creating Pending Driver: ${driverEmail}`);

        await axios.post(`${API_URL}/driver-leads/register`, {
            firstName: 'Pending',
            lastName: 'Driver',
            email: driverEmail,
            phone: `+254722${timestamp.toString().slice(-6)}`,
            dateOfBirth: '1995-05-15',
            street: '123 Test Ave',
            city: 'Nairobi',
            county: 'Nairobi',
            vehicleType: 'car',
            licensePlate: `KDA ${Math.floor(100 + Math.random() * 900)}X`,
            nationalId: `ID-${timestamp}`,
            drivingLicense: `DL-${timestamp}`,
            password: 'Password123!',
            recaptchaToken: 'SIMULATED',
            agreeToTerms: true
        });
        console.log('✅ Pending Driver Registered via Driver Leads Service');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('❌ Registration Failed:', error.response?.data || error.message);
        } else {
            console.error('❌ Registration Failed:', error);
        }
    }
}

registerDriver();
