import apiClient from '@/shared/utils/apiClient';
import { SOSIncident, SOSIncidentLog } from './types';

export const fetchSosIncident = async (id: string): Promise<SOSIncident> => {
  const { data } = await apiClient.get<SOSIncident>(`/admin/sos-incidents/${id}`);
  return data;
};

export const postIncidentLog = async (id: string, note: string): Promise<SOSIncidentLog> => {
  const { data } = await apiClient.post<SOSIncidentLog>(
    `/admin/sos-incidents/${id}/logs`,
    { note }
  );
  return data;
};

export const resolveSosIncident = async (id: string, note: string): Promise<{ success: boolean; status: 'RESOLVED' }> => {
  if (!note.trim()) {
    throw new Error('Resolution note cannot be empty.');
  }
  const { data } = await apiClient.post<{ success: boolean; status: 'RESOLVED' }>(
    `/admin/sos-incidents/${id}/resolve`,
    { note }
  );
  return data;
}