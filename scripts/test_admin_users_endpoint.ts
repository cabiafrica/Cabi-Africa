/**
 * Simple diagnostic test for admin/users endpoint
 */

import axios from 'axios';

const API_URL = 'http://localhost:3333/api';
const ADMIN_EMAIL = 'ke.africabi@gmail.com';
const ADMIN_PASSWORD = 'Admin@2026';

async function test() {
    try {
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('Token:', token);

        console.log('\n2. Getting admin users list...');
        const usersResponse = await axios.get(`${API_URL}/admin/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('✅ Success!');
        console.log('Users:', JSON.stringify(usersResponse.data, null, 2));
    } catch (error: any) {
        console.error('❌ Error:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', error.response.headers);
        } else {
            console.error(error.message);
        }
    }
}

test();
