import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '../context/AuthContext';

export const useSettings = () => {
    const { user, updateUser } = useAuth();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user?.id]);

    const fetchSettings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await apiClient.get(`/settings/user/${user.id}`);
            setSettings(response.data);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch settings');
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings: any) => {
        if (!user) return;
        setLoading(true);

        // Optimistic update
        const previousSettings = { ...settings };
        setSettings({ ...settings, ...newSettings });

        try {
            const response = await apiClient.put(`/settings/user/${user.id}`, newSettings);

            const updatedData = response.data;
            setSettings(updatedData);

            // Sync with AuthContext and localStorage
            updateUser({ ...user, ...updatedData });

            setLoading(false);
            return updatedData;
        } catch (err: any) {
            // Rollback
            setSettings(previousSettings);
            setError(err.response?.data?.message || 'Failed to update settings');
            setLoading(false);
            throw err;
        }
    };

    const updateRidePreferences = async (prefs: any) => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await apiClient.put(`/settings/preferences/${user.id}`, prefs);
            setLoading(false);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update ride preferences');
            setLoading(false);
            throw err;
        }
    };

    return { settings, updateSettings, updateRidePreferences, loading, error, refreshSettings: fetchSettings };
};
