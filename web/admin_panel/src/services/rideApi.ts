// API Configuration
const API_BASE_URL = 'http://localhost:3334/api';

// API Service
export const rideAPI = {
    async getAllRides(filters?: {
        status?: string;
        search?: string;
        date?: string;
        page?: number;
        limit?: number;
    }) {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value));
                }
            });
        }

        const response = await fetch(`${API_BASE_URL}/rides/admin/all?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    async getStatistics(startDate?: string, endDate?: string) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`${API_BASE_URL}/rides/admin/statistics?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    },
};
