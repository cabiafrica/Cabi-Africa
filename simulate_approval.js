
const axios = require('axios');

async function simulateApproval() {
    try {
        const leadId = '97c01ee0-e434-4a16-b18a-f0e0b615ab7b';
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('http://localhost:3333/api/auth/login', {
            email: 'ithrivebusinessnetworks@gmail.com',
            password: 'Admin@2026'
        });

        const token = loginRes.data.accessToken;
        console.log('Login successful. Token acquired.');

        console.log(`Approving Lead ${leadId}...`);
        const approveRes = await axios.post(`http://localhost:3010/api/v1/driver-leads/${leadId}/approve`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Approval response:', JSON.stringify(approveRes.data, null, 2));
        console.log('✅ Driver Lead Approved and User Created.');
    } catch (error) {
        console.error('❌ Simulation failed:', error.response?.data || error.message);
    }
}

simulateApproval();
