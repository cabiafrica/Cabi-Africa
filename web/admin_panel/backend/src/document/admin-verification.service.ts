import { Injectable, Logger } from '@nestjs/common';

export interface PassengerVerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REVIEW_REQUIRED';
  verificationLevel: 'NONE' | 'BASIC' | 'SELFIE' | 'BIOMETRIC';
  submittedAt: Date;
  documents: {
    id: DocumentInfo;
    nationalId: DocumentInfo;
    passportPhoto: DocumentInfo;
    selfie: DocumentInfo;
    certificate: DocumentInfo;
    fingerprint: DocumentInfo;
  };
  aiAnalysis: {
    confidence: number;
    documentType: string;
    quality: string;
    warnings: string[];
    errors: string[];
  } | null;
  adminNotes: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
}

interface DocumentInfo {
  uploaded: boolean;
  verified: boolean;
  url?: string;
  aiConfidence?: number;
}

@Injectable()
export class AdminVerificationService {
  private readonly logger = new Logger(AdminVerificationService.name);

  async getVerificationRequests(filters: {
    status?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: PassengerVerificationRequest[]; total: number }> {
    const { status, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // For now, use mock data since we store in memory
    // In production, query from database
    const mockRequests = this.getMockVerificationRequests();

    let filtered = mockRequests;

    // Filter by status
    if (status && status !== 'ALL') {
      filtered = filtered.filter(r => r.status === status);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(r => 
        r.userName.toLowerCase().includes(searchLower) ||
        r.userPhone.includes(search) ||
        r.userEmail.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    const data = filtered.slice(skip, skip + limit);

    return { data, total };
  }

  async getVerificationRequest(id: string): Promise<PassengerVerificationRequest | null> {
    const mockRequests = this.getMockVerificationRequests();
    return mockRequests.find(r => r.id === id) || null;
  }

  async approveVerification(id: string, adminId: string, notes?: string): Promise<any> {
    this.logger.log(`Approving verification ${id} by admin ${adminId}`);

    // In production, update database
    return {
      success: true,
      message: 'Verification approved successfully',
      status: 'VERIFIED',
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };
  }

  async rejectVerification(id: string, adminId: string, reason: string): Promise<any> {
    this.logger.log(`Rejecting verification ${id} by admin ${adminId}. Reason: ${reason}`);

    // In production, update database
    return {
      success: true,
      message: 'Verification rejected',
      status: 'REJECTED',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    };
  }

  async requestAdditionalInfo(id: string, adminId: string, requiredInfo: string[]): Promise<any> {
    this.logger.log(`Requesting additional info for verification ${id}`);

    return {
      success: true,
      message: 'Request sent to passenger',
      status: 'REVIEW_REQUIRED',
      requiredInfo,
    };
  }

  async getVerificationStats(): Promise<any> {
    const mockRequests = this.getMockVerificationRequests();

    return {
      total: mockRequests.length,
      pending: mockRequests.filter(r => r.status === 'PENDING').length,
      verified: mockRequests.filter(r => r.status === 'VERIFIED').length,
      rejected: mockRequests.filter(r => r.status === 'REJECTED').length,
      reviewRequired: mockRequests.filter(r => r.status === 'REVIEW_REQUIRED').length,
      byLevel: {
        none: mockRequests.filter(r => r.verificationLevel === 'NONE').length,
        basic: mockRequests.filter(r => r.verificationLevel === 'BASIC').length,
        selfie: mockRequests.filter(r => r.verificationLevel === 'SELFIE').length,
        biometric: mockRequests.filter(r => r.verificationLevel === 'BIOMETRIC').length,
      },
    };
  }

  private getMockVerificationRequests(): PassengerVerificationRequest[] {
    return [
      {
        id: 'vr-001',
        userId: 'user-001',
        userName: 'John Doe',
        userPhone: '+254712345678',
        userEmail: 'john@example.com',
        status: 'PENDING',
        verificationLevel: 'SELFIE',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        documents: {
          id: { uploaded: true, verified: true, aiConfidence: 0.92 },
          nationalId: { uploaded: true, verified: true, url: '/uploads/national-id/001.jpg' },
          passportPhoto: { uploaded: true, verified: true, url: '/uploads/passport-photo/001.jpg' },
          selfie: { uploaded: true, verified: true, url: '/uploads/selfie/001.jpg' },
          certificate: { uploaded: false, verified: false },
          fingerprint: { uploaded: false, verified: false },
        },
        aiAnalysis: {
          confidence: 0.89,
          documentType: 'NATIONAL_ID',
          quality: 'GOOD',
          warnings: ['Document slightly blurred'],
          errors: [],
        },
        adminNotes: '',
        reviewedBy: null,
        reviewedAt: null,
      },
      {
        id: 'vr-002',
        userId: 'user-002',
        userName: 'Jane Smith',
        userPhone: '+254798765432',
        userEmail: 'jane@example.com',
        status: 'PENDING',
        verificationLevel: 'BASIC',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        documents: {
          id: { uploaded: true, verified: true },
          nationalId: { uploaded: true, verified: false, aiConfidence: 0.65 },
          passportPhoto: { uploaded: false, verified: false },
          selfie: { uploaded: false, verified: false },
          certificate: { uploaded: false, verified: false },
          fingerprint: { uploaded: false, verified: false },
        },
        aiAnalysis: {
          confidence: 0.65,
          documentType: 'NATIONAL_ID',
          quality: 'FAIR',
          warnings: ['Low confidence in ID number extraction'],
          errors: ['ID number format mismatch'],
        },
        adminNotes: '',
        reviewedBy: null,
        reviewedAt: null,
      },
      {
        id: 'vr-003',
        userId: 'user-003',
        userName: 'Robert Otieno',
        userPhone: '+254711223344',
        userEmail: 'robert@example.com',
        status: 'VERIFIED',
        verificationLevel: 'BIOMETRIC',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        documents: {
          id: { uploaded: true, verified: true },
          nationalId: { uploaded: true, verified: true },
          passportPhoto: { uploaded: true, verified: true },
          selfie: { uploaded: true, verified: true },
          certificate: { uploaded: true, verified: true },
          fingerprint: { uploaded: true, verified: true },
        },
        aiAnalysis: {
          confidence: 0.95,
          documentType: 'NATIONAL_ID',
          quality: 'EXCELLENT',
          warnings: [],
          errors: [],
        },
        adminNotes: 'All documents verified successfully',
        reviewedBy: 'admin-001',
        reviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ];
  }
}
