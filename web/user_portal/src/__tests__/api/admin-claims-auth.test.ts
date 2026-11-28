import reviewHandler from '../../pages/api/admin/vehicles/claims/[id]/review';
import listHandler from '../../pages/api/admin/vehicles/claims/index';
import { signUserToken } from '../../lib/serverAuth';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    vehicleBenefitClaim: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    vehicleQualification: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

function createMockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Admin Vehicle Claims API Authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated GET /api/admin/vehicles/claims with 401', async () => {
    const req: any = { method: 'GET', headers: {}, query: {} };
    const res = createMockRes();
    await listHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.vehicleBenefitClaim.findMany).not.toHaveBeenCalled();
  });

  it('rejects non-admin GET /api/admin/vehicles/claims with 403', async () => {
    const token = signUserToken({ sub: 'driver-1', role: 'DRIVER' });
    const req: any = { method: 'GET', headers: { authorization: `Bearer ${token}` }, query: {} };
    const res = createMockRes();
    await listHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rejects unauthenticated POST review with 401', async () => {
    const req: any = {
      method: 'POST',
      headers: {},
      query: { id: 'claim-1' },
      body: { status: 'APPROVED', adminId: 'spoofed-admin' },
    };
    const res = createMockRes();
    await reviewHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.vehicleBenefitClaim.update).not.toHaveBeenCalled();
  });

  it('uses verified JWT admin.sub instead of body.adminId on POST review', async () => {
    const token = signUserToken({ sub: 'real-admin-42', role: 'ADMIN' });
    prisma.vehicleBenefitClaim.findUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'PENDING',
      vehicleId: 'veh-1',
    });
    prisma.vehicleBenefitClaim.update.mockResolvedValue({
      id: 'claim-1',
      status: 'APPROVED',
      reviewedByAdminId: 'real-admin-42',
    });

    const req: any = {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      query: { id: 'claim-1' },
      body: { status: 'APPROVED', adminId: 'spoofed-admin' },
    };
    const res = createMockRes();
    await reviewHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(prisma.vehicleBenefitClaim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reviewedByAdminId: 'real-admin-42' }),
      })
    );
  });
});
