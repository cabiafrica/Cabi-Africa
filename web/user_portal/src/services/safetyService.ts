import apiClient from '@/lib/apiClient';

export type OccurrenceStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISPUTED';
export type OccurrenceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OccurrenceCategory =
  | 'CRIME' | 'TRAFFIC_OFFENSE' | 'SAFETY_VIOLATION' | 'POLICY_VIOLATION'
  | 'HARASSMENT' | 'FRAUD' | 'PROPERTY_DAMAGE' | 'MEDICAL_EMERGENCY'
  | 'DISPUTE' | 'SUSPICIOUS_ACTIVITY' | 'VEHICLE_ISSUE' | 'ENVIRONMENTAL';

export interface UserIncidentCounterparty {
  name: string;
  photoUrl?: string | null;
  rating?: number | null;
}

export interface UserStatement {
  id: string;
  text: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  submittedAt: string;
  reviewNotes: string | null;
}

export interface UserIncident {
  id: string;
  obNumber: string;
  title: string;
  description: string;
  category: OccurrenceCategory;
  severity: OccurrenceSeverity;
  status: OccurrenceStatus;
  occurredAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  locationAddress: string | null;
  locationCity: string | null;
  myRole: 'driver' | 'passenger';
  counterparty: UserIncidentCounterparty | null;
  latestLog: { notes: string; timestamp: string } | null;
  /** Statement this user has already submitted for this incident, if any */
  myStatement?: UserStatement | null;
}

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3335/api';

class SafetyService {
  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getUserIncidents(userId: string): Promise<UserIncident[]> {
    const response = await apiClient.get(`/admin/sos-incidents/user/${userId}`, {
      baseURL: ADMIN_API_BASE,
      headers: this.getHeaders(),
    });
    return response.data?.data ?? [];
  }

  /** Submit the authenticated user's statement for an incident */
  async submitStatement(occurrenceId: string, userId: string, text: string): Promise<UserStatement> {
    const response = await apiClient.post(
      `/admin/sos-incidents/${occurrenceId}/statement`,
      { objectorId: userId, text },
      { baseURL: ADMIN_API_BASE, headers: this.getHeaders() },
    );
    const d = response.data?.data;
    return {
      id: d.id,
      text: d.text,
      status: d.status,
      submittedAt: d.submittedAt,
      reviewNotes: null,
    };
  }
}

export const safetyService = new SafetyService();
