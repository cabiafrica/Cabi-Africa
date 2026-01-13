import axios from 'axios';
import type { Occurrence, OccurrenceObjection } from '../types/occurrence';

const API_BASE_URL = process.env.NEXT_PUBLIC_OCCURRENCE_SERVICE_URL || 'http://localhost:3005';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const occurrenceService = {
    // Get user's occurrence history
    getUserHistory: async (userId: string, role: 'passenger' | 'driver'): Promise<Occurrence[]> => {
        const response = await api.get(`/occurrences/user/${userId}/history`, {
            params: { role },
        });
        return response.data;
    },

    // Get occurrence by ID
    getOccurrence: async (id: string): Promise<Occurrence> => {
        const response = await api.get(`/occurrences/${id}`);
        return response.data;
    },

    // File objection
    fileObjection: async (data: {
        occurrenceId: string;
        objectorId: string;
        objectionText: string;
        supportingEvidence?: any;
    }): Promise<OccurrenceObjection> => {
        const response = await api.post('/objections', data);
        return response.data;
    },

    // Get user's objections
    getUserObjections: async (userId: string): Promise<OccurrenceObjection[]> => {
        const response = await api.get(`/objections/user/${userId}`);
        return response.data;
    },
};
