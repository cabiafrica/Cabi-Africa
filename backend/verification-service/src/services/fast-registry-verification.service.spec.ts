import { FastRegistryVerificationService } from './fast-registry-verification.service';
import { SmileIdClientService } from './smile-id-client.service';
import { VerificationDocumentType, VerificationStatus } from '@prisma/client';

describe('FastRegistryVerificationService', () => {
  let service: FastRegistryVerificationService;
  let mockPrisma: any;
  let mockSmileIdClient: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      vehicle: {
        findFirst: jest.fn(),
      },
    };

    mockSmileIdClient = {
      verifyDrivingLicense: jest.fn().mockResolvedValue({
        success: true,
        licenseClass: 'Class D1 (Commercial PSV)',
        expiryDate: '2027-12-15',
        confidenceValue: 0.98,
        fullName: 'JOHN KAMAU MWANGI',
        resultCode: '1012',
        resultText: 'NTSA Verified',
        source: 'SMILE_ID_NTSA',
      }),
      verifyNationalId: jest.fn().mockResolvedValue({
        success: true,
        confidenceValue: 0.98,
        fullName: 'JOHN KAMAU MWANGI',
        resultCode: '1012',
        source: 'SMILE_ID_IPRS',
      }),
    };

    service = new FastRegistryVerificationService(
      mockPrisma as any,
      mockSmileIdClient as any,
    );
  });

  describe('Traffic Act Cap 403 - Age Validation', () => {
    it('should REJECT driver younger than statutory minimum age of 24 years', async () => {
      // Driver born 2005 (age 21 in 2026)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-underage',
        name: 'YOUNG DRIVER',
        dateOfBirth: new Date('2005-01-01'),
        nationalId: '38123456',
      });

      const fakeImageBuffer = Buffer.from('FAKE_DL_IMAGE_CONTENT');
      const result = await service.verifyDocumentFastPath(
        'user-underage',
        'DRIVERS_LICENSE' as VerificationDocumentType,
        fakeImageBuffer,
      );

      expect(result.isAutoApproved).toBe(false);
      expect(result.status).toBe(VerificationStatus.FAILED);
      expect(result.decisionTier).toBe('TIER_3_REJECTED');
      expect(result.rejectionReason).toContain('statutory minimum age of 24 years');
    });

    it('should APPROVE driver 24 years or older with valid NTSA Class D1 DL', async () => {
      // Driver born 1995 (age 31 in 2026)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-valid-age',
        name: 'JOHN KAMAU MWANGI',
        dateOfBirth: new Date('1995-05-20'),
        nationalId: '30123456',
      });

      const fakeImageBuffer = Buffer.from('FAKE_DL_IMAGE_CONTENT');
      const result = await service.verifyDocumentFastPath(
        'user-valid-age',
        'DRIVERS_LICENSE' as VerificationDocumentType,
        fakeImageBuffer,
      );

      expect(result.isAutoApproved).toBe(true);
      expect(result.status).toBe(VerificationStatus.VERIFIED);
      expect(result.decisionTier).toBe('TIER_1_AUTO_APPROVED');
      expect(result.extractedData.licenseClass).toContain('Class D1');
      expect(result.extractedData.verificationSource).toBe('KENYAN_NTSA_REGISTRY');
    });
  });

  describe('DCI Police Clearance Certificate', () => {
    it('should validate Police Clearance Certificate and mark ACTIVE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-valid',
        name: 'JOHN KAMAU MWANGI',
      });

      const fakeImageBuffer = Buffer.from('FAKE_PCC_QR_CODE');
      const result = await service.verifyDocumentFastPath(
        'user-valid',
        'POLICE_CLEARANCE' as VerificationDocumentType,
        fakeImageBuffer,
      );

      expect(result.isAutoApproved).toBe(true);
      expect(result.status).toBe(VerificationStatus.VERIFIED);
      expect(result.extractedData.verificationSource).toBe('DCI_ECITIZEN_GATEWAY');
      expect(result.extractedData.registryStatus).toBe('VERIFIED_ACTIVE');
    });
  });
});
