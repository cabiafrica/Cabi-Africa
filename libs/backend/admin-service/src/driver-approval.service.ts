import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { DocumentStatus, UserStatus, VehicleType } from '@prisma/client';

export interface DriverDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  appliedAt: Date;
  documents: any[];
  vehicle: any;
  aiScore: number;
}

@Injectable()
export class DriverApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingRegistrations() {
    // We consider "Pending" if the user status is PROSPECT and has a driverProfile
    const drivers = await this.prisma.user.findMany({
      where: {
        role: 'DRIVER',
        status: UserStatus.PROSPECT,
        driverProfile: { isNot: null }
      },
      include: {
        driverProfile: {
          include: {
             documents: true,
             vehicles: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return drivers.map(d => ({
      id: d.id,
      name: d.fullName,
      email: d.email,
      phone: d.phone,
      status: d.status,
      overallAiScore: 85, 
      appliedAt: d.createdAt,
      vehicle: d.driverProfile?.vehicles || null,
    }));
  }

  async getDriverDetails(id: string): Promise<DriverDetail> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        driverProfile: {
          include: {
            documents: true,
            vehicles: true
          }
        }
      }
    });

    if (!user || !user.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      appliedAt: user.createdAt,
      documents: user.driverProfile.documents,
      vehicle: user.driverProfile.vehicles || null,
      aiScore: 85,
    };
  }

  async approveDriver(id: string, category: VehicleType) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { 
        driverProfile: {
          include: { vehicles: true }
        } 
      }
    });

    if (!user || !user.driverProfile) {
      throw new NotFoundException('Driver not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Update user status to ACTIVE
      await tx.user.update({
        where: { id },
        data: { status: UserStatus.ACTIVE }
      });

      // 2. Update all pending documents to APPROVED
      await tx.document.updateMany({
        where: { driverProfileId: user.driverProfile!.id, status: DocumentStatus.PENDING },
        data: { status: DocumentStatus.APPROVED }
      });

      // 3. Update vehicle category and mark as verified
      if (user.driverProfile!.vehicles) {
        await tx.vehicle.update({
          where: { id: user.driverProfile!.vehicles.id },
          data: { type: category }
        });
      }

      return { success: true };
    });
  }

  async rejectDriver(id: string, reason: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { driverProfile: true }
    });

    if (!user || !user.driverProfile) {
      throw new NotFoundException('Driver not found');
    }

    // Mark all pending documents as rejected and set the reason globally on the user or individual docs
    // In this schema, it's better to mark the specific documents that failed or use a global rejection reason if we added one.
    // For now, let's mark all PENDING ones as REJECTED with the reason.
    await this.prisma.document.updateMany({
      where: { driverProfileId: user.driverProfile.id, status: DocumentStatus.PENDING },
      data: { status: DocumentStatus.REJECTED, rejectionReason: reason }
    });

    return { success: true };
  }
}
