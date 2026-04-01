import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3334/api';

export const useSettings = () => {
    const { user, updateUser } = useAuthContext();
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
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/settings/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        const token = localStorage.getItem('authToken');

        // Optimistic update
        const previousSettings = { ...settings };
        setSettings({ ...settings, ...newSettings });

        try {
            const response = await axios.put(`${API_URL}/settings/user/${user.id}`, newSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });

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

    const updateSystemSetting = async (key: string, value: any) => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.put(`${API_URL}/settings/system/${key}`, { value }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoading(false);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update system setting');
            setLoading(false);
            throw err;
        }
    };

    return { settings, updateSettings, updateSystemSetting, loading, error, refreshSettings: fetchSettings };
};
