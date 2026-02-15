import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { SosPenaltyType } from '@prisma/client';

import { UpdateSosConfigDto } from './dto/update-sos-config.dto';

@Injectable()
export class SosConfigService {
  constructor(private readonly prisma: PrismaService) { }

  async getConfig() {
    let config = await this.prisma.sosConfig.findFirst({
      where: { isActive: true },
      include: { badge: true },
    });

    if (!config) {
      // Create default if not exists
      config = await this.prisma.sosConfig.create({
        data: {
          type: 'FEE',
          feeAmount: 500,
          isActive: true,
        },
        include: { badge: true },
      });
    }

    return config;
  }

  async updateConfig(dto: UpdateSosConfigDto) {
    const activeConfig = await this.prisma.sosConfig.findFirst({
      where: { isActive: true },
    });

    if (activeConfig) {
      return this.prisma.sosConfig.update({
        where: { id: activeConfig.id },
        data: {
          type: dto.type,
          feeAmount: dto.type === 'FEE' ? dto.feeAmount : null,
          badgeId: dto.type === 'REVOKE_BADGE' ? dto.badgeId : null,
        },
        include: { badge: true },
      });
    }

    return this.prisma.sosConfig.create({
      data: {
        type: dto.type,
        feeAmount: dto.feeAmount,
        badgeId: dto.badgeId,
        isActive: true,
      },
      include: { badge: true },
    });
  }
}
