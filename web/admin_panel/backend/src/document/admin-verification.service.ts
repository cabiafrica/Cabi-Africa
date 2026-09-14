import { Injectable, Logger, NotFoundException, HttpException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

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
  private readonly http: AxiosInstance;

  constructor() {
    const baseURL =
      process.env.VERIFICATION_SERVICE_URL ??
      'http://localhost:3003/api/v1/verification';
    this.http = axios.create({ baseURL, timeout: 10_000 });
  }

  async getVerificationRequests(filters: {
    status?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: PassengerVerificationRequest[]; total: number }> {
    const { status, search, page, limit } = filters;
    try {
      const res = await this.http.get('/admin/requests', {
        params: {
          ...(status && status !== 'ALL' ? { status } : {}),
          ...(search ? { search } : {}),
          page,
          limit,
        },
      });
      return res.data as { data: PassengerVerificationRequest[]; total: number };
    } catch (err: any) {
      this.logger.error(`getVerificationRequests failed: ${err?.message}`);
      return { data: [], total: 0 };
    }
  }

  async getVerificationRequest(id: string): Promise<PassengerVerificationRequest | null> {
    try {
      const res = await this.http.get(`/admin/requests/${id}`);
      return res.data as PassengerVerificationRequest;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      this.logger.error(`getVerificationRequest(${id}) failed: ${err?.message}`);
      return null;
    }
  }

  async approveVerification(
    id: string,
    adminId: string,
    notes?: string,
  ): Promise<Record<string, unknown>> {
    try {
      const res = await this.http.post(`/admin/requests/${id}/approve`, {
        adminId,
        notes: notes ?? '',
      });
      this.logger.log(`Verification ${id} approved by admin ${adminId}`);
      return res.data as Record<string, unknown>;
    } catch (err: any) {
      this.logger.error(`approveVerification(${id}) failed: ${err?.message}`);
      throw new HttpException(
        err?.response?.data?.message ?? 'Failed to approve verification',
        err?.response?.status ?? 500,
      );
    }
  }

  async rejectVerification(
    id: string,
    adminId: string,
    reason: string,
  ): Promise<Record<string, unknown>> {
    try {
      const res = await this.http.post(`/admin/requests/${id}/reject`, {
        adminId,
        reason,
      });
      this.logger.log(`Verification ${id} rejected by admin ${adminId}. Reason: ${reason}`);
      return res.data as Record<string, unknown>;
    } catch (err: any) {
      this.logger.error(`rejectVerification(${id}) failed: ${err?.message}`);
      throw new HttpException(
        err?.response?.data?.message ?? 'Failed to reject verification',
        err?.response?.status ?? 500,
      );
    }
  }

  async requestAdditionalInfo(
    id: string,
    adminId: string,
    requiredInfo: string[],
  ): Promise<Record<string, unknown>> {
    try {
      const res = await this.http.post(`/admin/requests/${id}/request-info`, {
        adminId,
        requiredInfo,
      });
      this.logger.log(`Additional info requested for verification ${id}`);
      return res.data as Record<string, unknown>;
    } catch (err: any) {
      this.logger.error(`requestAdditionalInfo(${id}) failed: ${err?.message}`);
      throw new HttpException(
        err?.response?.data?.message ?? 'Failed to request additional info',
        err?.response?.status ?? 500,
      );
    }
  }

  async getVerificationStats(): Promise<Record<string, unknown>> {
    try {
      const res = await this.http.get('/admin/stats');
      return res.data as Record<string, unknown>;
    } catch (err: any) {
      this.logger.error(`getVerificationStats failed: ${err?.message}`);
      // Return zeroed structure so UI doesn't crash
      return {
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0,
        reviewRequired: 0,
        byLevel: { none: 0, basic: 0, selfie: 0, biometric: 0 },
      };
    }
  }
}

