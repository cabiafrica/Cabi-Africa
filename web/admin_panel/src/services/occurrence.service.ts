import axios from 'axios';
import type {
    Occurrence,
    OccurrenceStats,
    OccurrenceObjection,
} from '../types/occurrence.types';

const API_BASE_URL = import.meta.env.VITE_OCCURRENCE_SERVICE_URL || 'http://localhost:3005';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const occurrenceApi = {
    // Get all occurrences with filters
    getOccurrences: async (params?: any) => {
        const response = await api.get<{ data: Occurrence[]; meta: any }>('/occurrences', { params });
        return response.data;
    },

    // Get occurrence by ID
    getOccurrence: async (id: string) => {
        const response = await api.get<Occurrence>(`/occurrences/${id}`);
        return response.data;
    },

    // Create occurrence
    createOccurrence: async (data: any) => {
        const response = await api.post<Occurrence>('/occurrences', data);
        return response.data;
    },

    // Update occurrence
    updateOccurrence: async (id: string, data: any) => {
        const response = await api.patch<Occurrence>(`/occurrences/${id}`, data);
        return response.data;
    },

    // Resolve occurrence
    resolveOccurrence: async (id: string, data: { resolvedById: string; resolutionNotes: string }) => {
        const response = await api.post<Occurrence>(`/occurrences/${id}/resolve`, data);
        return response.data;
    },

    // Flag occurrence
    flagOccurrence: async (id: string, reason: string, actorId: string) => {
        const response = await api.post<Occurrence>(`/occurrences/${id}/flag`, { reason, actorId });
        return response.data;
    },

    // Get user history
    getUserHistory: async (userId: string, role: 'passenger' | 'driver') => {
        const response = await api.get<Occurrence[]>(`/occurrences/user/${userId}/history`, {
            params: { role },
        });
        return response.data;
    },

    // Get vehicle history
    getVehicleHistory: async (vehicleId: string) => {
        const response = await api.get<Occurrence[]>(`/occurrences/vehicle/${vehicleId}/history`);
        return response.data;
    },

    // Get statistics
    getStatistics: async () => {
        const response = await api.get<OccurrenceStats>('/occurrences/statistics');
        return response.data;
    },

    // Objections
    createObjection: async (data: any) => {
        const response = await api.post<OccurrenceObjection>('/objections', data);
        return response.data;
    },

    getPendingObjections: async () => {
        const response = await api.get<OccurrenceObjection[]>('/objections/pending');
        return response.data;
    },

    reviewObjection: async (id: string, data: any) => {
        const response = await api.post<OccurrenceObjection>(`/objections/${id}/review`, data);
        return response.data;
    },

    getUserObjections: async (userId: string) => {
        const response = await api.get<OccurrenceObjection[]>(`/objections/user/${userId}`);
        return response.data;
    },
};
