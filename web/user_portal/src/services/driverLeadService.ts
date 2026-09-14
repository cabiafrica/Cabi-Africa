import { useState, useEffect } from 'react';

export type ApplicationStatus = 'WEB_REGISTERED' | 'DOCUMENTS_PENDING' | 'BACKGROUND_CHECK_PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface ProspectStatus {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName?: string;
    status: ApplicationStatus;
    nextAction: string;
    submittedDate: string;
    documents?: any[];
}

// Mock service
class DriverLeadService {
    private mockProspect: ProspectStatus = {
        id: 'prospect-123',
        email: 'driver@example.com',
        firstName: 'John',
        lastName: 'Doe',
        status: 'DOCUMENTS_PENDING',
        nextAction: 'Download the app to submit your documents',
        submittedDate: new Date().toISOString()
    };

    async getProspectStatus(email: string): Promise<ProspectStatus> {
        return { ...this.mockProspect, email }; // Echo back email
    }
}

export const driverLeadService = new DriverLeadService();
